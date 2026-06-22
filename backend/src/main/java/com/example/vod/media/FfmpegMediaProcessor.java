package com.example.vod.media;

import com.example.vod.config.MediaProperties;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class FfmpegMediaProcessor {

    private static final Logger log = LoggerFactory.getLogger(FfmpegMediaProcessor.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final MediaProperties properties;

    public FfmpegMediaProcessor(MediaProperties properties) {
        this.properties = properties;
    }

    public Path assetDir(UUID assetId) {
        return Path.of(properties.getProcessedDir(), assetId.toString()).toAbsolutePath().normalize();
    }

    public Path transcode(UUID assetId, Path rawInput) throws IOException {
        Path outDir = assetDir(assetId).resolve("transcoded");
        Files.createDirectories(outDir);
        Path output = outDir.resolve("video.mp4");

        List<String> args = List.of(
            properties.getFfmpegPath(), "-y",
            "-i", rawInput.toString(),
            "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "128k",
            "-movflags", "+faststart",
            output.toString()
        );
        runFfmpeg(args);
        return output;
    }

    public Path packageHls(UUID assetId, Path mp4) throws IOException {
        Path outDir = assetDir(assetId).resolve("program");
        Files.createDirectories(outDir);
        Path manifest = outDir.resolve("master.m3u8");

        List<String> args = List.of(
            properties.getFfmpegPath(), "-y",
            "-i", mp4.toString(),
            "-c", "copy",
            "-f", "hls",
            "-hls_time", String.valueOf(properties.getHlsSegmentSeconds()),
            "-hls_playlist_type", "vod",
            "-hls_segment_filename", outDir.resolve("segment_%03d.ts").toString(),
            manifest.toString()
        );
        runFfmpeg(args);
        return manifest;
    }

    public DrmResult encryptHls(UUID assetId, Path plainManifest) throws IOException {
        Path drmDir = assetDir(assetId).resolve("drm");
        Files.createDirectories(drmDir);

        byte[] keyBytes = new byte[16];
        RANDOM.nextBytes(keyBytes);
        Path keyFile = drmDir.resolve("license.key");
        Files.write(keyFile, keyBytes);

        byte[] ivBytes = new byte[16];
        RANDOM.nextBytes(ivBytes);
        String ivHex = HexFormat.of().formatHex(ivBytes);
        String keyUri = properties.getPublicBaseUrl()
                + "/playback/" + assetId + "/license.key";

        Path keyInfo = drmDir.resolve("key-info.txt");
        Files.writeString(keyInfo, keyUri + "\n" + keyFile.toAbsolutePath() + "\n" + ivHex + "\n");

        Path encryptedManifest = drmDir.resolve("master.m3u8");

        List<String> args = new ArrayList<>(List.of(
            properties.getFfmpegPath(), "-y",
            "-i", plainManifest.toString(),
            "-c", "copy",
            "-f", "hls",
            "-hls_time", String.valueOf(properties.getHlsSegmentSeconds()),
            "-hls_playlist_type", "vod",
            "-hls_key_info_file", keyInfo.toString(),
            "-hls_segment_filename", drmDir.resolve("segment_%03d.ts").toString(),
            encryptedManifest.toString()
        ));
        runFfmpeg(args);

        // keyId is an opaque handle; the AES content key never leaves the filesystem (license.key).
        String keyId = UUID.randomUUID().toString();
        return new DrmResult(encryptedManifest, keyFile, keyId);
    }

    public record DrmResult(Path encryptedManifest, Path keyFile, String keyId) {}

    // Trick-play sprite + WebVTT thumbnail track. Samples one frame every
    // 10 s at 160x90, tiles them into one JPEG, and emits a sibling .vtt
    // pointing into the sprite via the standard `#xywh=` fragment.
    public ThumbnailResult generateThumbnails(UUID assetId, Path mp4) throws IOException {
        Path outDir = assetDir(assetId).resolve("thumbs");
        Files.createDirectories(outDir);
        Path sprite = outDir.resolve("sprite.jpg");
        Path vtt = outDir.resolve("thumbnails.vtt");

        Duration duration = probeDuration(mp4);
        int intervalSec = 10;
        int thumbW = 160;
        int thumbH = 90;
        int cols = 10;

        int durationSec = Math.max(1, (int) duration.getSeconds());
        // ceil so a 25 s clip still gets a frame at 20 s.
        int nThumbs = Math.max(1, (durationSec + intervalSec - 1) / intervalSec);
        int rows = Math.max(1, (nThumbs + cols - 1) / cols);

        List<String> args = List.of(
            properties.getFfmpegPath(), "-y",
            "-i", mp4.toString(),
            "-vf", "fps=1/" + intervalSec + ",scale=" + thumbW + ":" + thumbH
                    + ",tile=" + cols + "x" + rows,
            "-frames:v", "1",
            "-an",
            "-q:v", "5",
            sprite.toString()
        );
        runFfmpeg(args);

        StringBuilder sb = new StringBuilder(256 + nThumbs * 64);
        sb.append("WEBVTT\n\n");
        for (int i = 0; i < nThumbs; i++) {
            int startSec = i * intervalSec;
            int endSec = Math.min(durationSec, startSec + intervalSec);
            int col = i % cols;
            int row = i / cols;
            int x = col * thumbW;
            int y = row * thumbH;
            sb.append(formatVttTimestamp(startSec)).append(" --> ")
              .append(formatVttTimestamp(endSec)).append('\n')
              .append("sprite.jpg#xywh=").append(x).append(',').append(y).append(',')
              .append(thumbW).append(',').append(thumbH).append("\n\n");
        }
        Files.writeString(vtt, sb.toString());
        return new ThumbnailResult(sprite, vtt, nThumbs);
    }

    public record ThumbnailResult(Path sprite, Path vtt, int count) {}

    // ---- Multi-audio + multi-subtitle ----

    // Alt audio: pitch-shifted via rubberband, served as a single-segment
    // AAC playlist. Pitch shift preserves duration so the alt track plays
    // alongside the program with no drift. Demo only — real Spanish dub
    // would replace this with a properly localized vendor track.
    public Path generateAltAudio(UUID assetId, Path mp4, Duration duration) throws IOException {
        Path outDir = assetDir(assetId).resolve("audio_es");
        Files.createDirectories(outDir);
        Path aac = outDir.resolve("alt.aac");

        List<String> args = List.of(
            properties.getFfmpegPath(), "-y",
            "-i", mp4.toString(),
            "-vn",
            "-af", "rubberband=pitch=1.15",
            "-c:a", "aac", "-b:a", "96k",
            aac.toString()
        );
        runFfmpeg(args);

        // Hand-rolled single-segment HLS audio playlist. hls.js parses ADTS
        // AAC fine; no need to wrap in mpegts.
        double durSec = Math.max(1.0, duration.toMillis() / 1000.0);
        String playlist = "#EXTM3U\n"
            + "#EXT-X-VERSION:3\n"
            + "#EXT-X-TARGETDURATION:" + ((int) Math.ceil(durSec)) + "\n"
            + "#EXT-X-PLAYLIST-TYPE:VOD\n"
            + "#EXTINF:" + String.format(java.util.Locale.ROOT, "%.3f", durSec) + ",\n"
            + "alt.aac\n"
            + "#EXT-X-ENDLIST\n";
        Path playlistPath = outDir.resolve("playlist.m3u8");
        Files.writeString(playlistPath, playlist);
        return playlistPath;
    }

    // Subtitles: two VTT files (en, es) with stub cues every 5 s. Each
    // language gets a `[EN]` / `[ES]` prefix so they're distinguishable.
    public void generateSubtitles(UUID assetId, Duration duration) throws IOException {
        int totalSec = Math.max(5, (int) duration.getSeconds());
        writeSubtitleTrack(assetId, "en", "EN", totalSec);
        writeSubtitleTrack(assetId, "es", "ES", totalSec);
    }

    private void writeSubtitleTrack(UUID assetId, String lang, String label, int totalSec) throws IOException {
        Path outDir = assetDir(assetId).resolve("subs").resolve(lang);
        Files.createDirectories(outDir);

        int interval = 5;
        StringBuilder vtt = new StringBuilder(256 + (totalSec / interval) * 64);
        vtt.append("WEBVTT\n\n");
        for (int t = 0; t < totalSec; t += interval) {
            int end = Math.min(totalSec, t + interval);
            int cueIdx = t / interval + 1;
            vtt.append(formatVttTimestamp(t)).append(" --> ").append(formatVttTimestamp(end)).append('\n')
               .append('[').append(label).append("] caption ").append(cueIdx).append('\n').append('\n');
        }
        Files.writeString(outDir.resolve("cues.vtt"), vtt.toString());

        // Subtitle media playlist — single WebVTT segment for the whole asset.
        String playlist = "#EXTM3U\n"
            + "#EXT-X-VERSION:3\n"
            + "#EXT-X-TARGETDURATION:" + totalSec + "\n"
            + "#EXT-X-PLAYLIST-TYPE:VOD\n"
            + "#EXTINF:" + totalSec + ".000,\n"
            + "cues.vtt\n"
            + "#EXT-X-ENDLIST\n";
        Files.writeString(outDir.resolve("playlist.m3u8"), playlist);
    }

    // True master playlist that wires together the program variant + alt
    // audio + subtitles groups. The "English" audio entry has no URI — it's
    // muxed into the program variant and surfaces under that group ID.
    public void generateTrueMasterPlaylist(UUID assetId) throws IOException {
        Path outDir = assetDir(assetId).resolve("drm");
        Files.createDirectories(outDir);
        String master = """
            #EXTM3U
            #EXT-X-VERSION:6
            #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aud0",NAME="English",LANGUAGE="en",DEFAULT=YES,AUTOSELECT=YES,CHANNELS="2"
            #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aud0",NAME="Espanol",LANGUAGE="es",AUTOSELECT=YES,CHANNELS="2",URI="audio_es/playlist.m3u8"
            #EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="English",LANGUAGE="en",DEFAULT=YES,AUTOSELECT=YES,URI="subs/en/playlist.m3u8"
            #EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="Espanol",LANGUAGE="es",AUTOSELECT=YES,URI="subs/es/playlist.m3u8"
            #EXT-X-STREAM-INF:BANDWIDTH=1500000,CODECS="avc1.42c01e,mp4a.40.2",RESOLUTION=640x360,AUDIO="aud0",SUBTITLES="subs"
            program.m3u8
            """;
        Files.writeString(outDir.resolve("multi-master.m3u8"), master);
    }

    // Audio playlist references audio_es/{filename} as relative to its
    // playlist URL. Master playlist references audio_es/playlist.m3u8 and
    // subs/{lang}/playlist.m3u8 as relative to master.m3u8. All paths land
    // under {assetId}/, served by PlaybackController.

    // ffmpeg writes "Duration: HH:MM:SS.ff" to stderr when invoked with no
    // output target. Cheaper than depending on ffprobe (which the evermeet
    // ffmpeg build doesn't ship).
    public Duration probeDuration(Path input) throws IOException {
        ProcessBuilder pb = new ProcessBuilder(
            List.of(properties.getFfmpegPath(), "-i", input.toString()))
            .redirectErrorStream(true);
        Process p = pb.start();
        byte[] output;
        try {
            output = p.getInputStream().readAllBytes();
            boolean done = p.waitFor(30, TimeUnit.SECONDS);
            if (!done) {
                p.destroyForcibly();
                throw new IOException("ffmpeg probe timed out");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("ffmpeg probe interrupted", e);
        }
        // Exit code is non-zero (no output file) — that's expected; only parse stderr.
        String stderr = new String(output);
        Matcher m = Pattern.compile("Duration:\\s+(\\d+):(\\d+):(\\d+(?:\\.\\d+)?)").matcher(stderr);
        if (!m.find()) {
            throw new IOException("could not parse duration from ffmpeg output");
        }
        int h = Integer.parseInt(m.group(1));
        int mn = Integer.parseInt(m.group(2));
        double s = Double.parseDouble(m.group(3));
        return Duration.ofMillis((long) ((h * 3600 + mn * 60 + s) * 1000));
    }

    private static String formatVttTimestamp(int totalSec) {
        int h = totalSec / 3600;
        int m = (totalSec % 3600) / 60;
        int s = totalSec % 60;
        return String.format("%02d:%02d:%02d.000", h, m, s);
    }

    private void runFfmpeg(List<String> args) throws IOException {
        log.debug("running ffmpeg: {}", String.join(" ", args));
        ProcessBuilder pb = new ProcessBuilder(args).redirectErrorStream(true);
        Process p = pb.start();
        try {
            byte[] output = p.getInputStream().readAllBytes();
            boolean done = p.waitFor(15, TimeUnit.MINUTES);
            if (!done) {
                p.destroyForcibly();
                throw new IOException("ffmpeg timed out");
            }
            if (p.exitValue() != 0) {
                String tail = new String(output);
                if (tail.length() > 4000) tail = tail.substring(tail.length() - 4000);
                throw new IOException("ffmpeg failed:\n" + tail);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("ffmpeg interrupted", e);
        }
    }
}
