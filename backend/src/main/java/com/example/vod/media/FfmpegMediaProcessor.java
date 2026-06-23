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

    // ---- ABR ladder ----

    public record LadderTier(String label, int width, int height, int vBitrateKbps, int aBitrateKbps) {}

    // Fixed ladder. Real per-title encoding picks tiers from content
    // complexity (the convex-hull approach Netflix describes); for this
    // demo we just pick all tiers whose height ≤ source height — no
    // upscale. 240p included for very small sources so we always have
    // at least one tier.
    private static final List<LadderTier> LADDER = List.of(
        new LadderTier("240p",  426,  240,  300,  96),
        new LadderTier("360p",  640,  360,  600,  96),
        new LadderTier("480p",  854,  480, 1200,  96),
        new LadderTier("720p", 1280,  720, 2500,  128),
        new LadderTier("1080p",1920, 1080, 5000,  128)
    );

    public List<LadderTier> selectLadder(int sourceWidth, int sourceHeight) {
        List<LadderTier> picked = new ArrayList<>();
        for (LadderTier t : LADDER) {
            if (t.height() <= sourceHeight) picked.add(t);
        }
        if (picked.isEmpty()) {
            // Source smaller than the smallest ladder tier — fall back to a
            // single tier matching the source so we still produce output.
            picked.add(new LadderTier("src",
                roundDown2(sourceWidth), roundDown2(sourceHeight), 600, 96));
        }
        return picked;
    }

    private static int roundDown2(int v) { return v - (v % 2); }

    // Transcode one tier from the original raw upload. Each tier is its
    // own scale + bitrate pass — separate ffmpeg invocations make
    // parallelism trivial (the caller fans these out with CompletableFuture).
    public Path transcodeTier(UUID assetId, Path rawInput, LadderTier tier) throws IOException {
        Path outDir = assetDir(assetId).resolve("transcoded");
        Files.createDirectories(outDir);
        Path output = outDir.resolve("video_" + tier.label() + ".mp4");

        List<String> args = List.of(
            properties.getFfmpegPath(), "-y",
            "-i", rawInput.toString(),
            "-vf", "scale=" + tier.width() + ":" + tier.height(),
            "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
            "-b:v", tier.vBitrateKbps() + "k",
            "-maxrate", (int) (tier.vBitrateKbps() * 1.07) + "k",
            "-bufsize", (tier.vBitrateKbps() * 2) + "k",
            "-c:a", "aac", "-b:a", tier.aBitrateKbps() + "k",
            "-movflags", "+faststart",
            output.toString()
        );
        runFfmpeg(args);
        return output;
    }

    // Package one tier's mezzanine MP4 into a HLS playlist + segments.
    // Each tier gets its own subdirectory so segment filenames don't
    // collide and the player can switch by playlist swap.
    public Path packageHlsTier(UUID assetId, Path mp4, LadderTier tier) throws IOException {
        Path outDir = assetDir(assetId).resolve("program").resolve(tier.label());
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

    // Encrypt one tier's HLS using a shared content key + IV across all
    // tiers — the player can switch tier mid-playback without re-fetching
    // the license. URI is "../license.key" so the variant playlist (one
    // level deep under drm/) resolves it back to the shared key at the
    // drm/ root.
    public void encryptHlsTier(UUID assetId, Path plainManifest, LadderTier tier,
                               byte[] keyBytes, byte[] ivBytes) throws IOException {
        Path drmDir = assetDir(assetId).resolve("drm");
        Path tierDir = drmDir.resolve(tier.label());
        Files.createDirectories(tierDir);

        Path keyFile = drmDir.resolve("license.key");
        if (!Files.exists(keyFile)) {
            Files.write(keyFile, keyBytes);
        }
        String ivHex = HexFormat.of().formatHex(ivBytes);

        // URI is relative-up so it resolves to the shared key. The
        // PlaybackController rewrites it at request time with the signed
        // query — see rewriteLicenseUri's path-preserving regex.
        Path keyInfo = tierDir.resolve("key-info.txt");
        Files.writeString(keyInfo, "../license.key\n" + keyFile.toAbsolutePath() + "\n" + ivHex + "\n");

        Path encryptedManifest = tierDir.resolve("program.m3u8");

        List<String> args = List.of(
            properties.getFfmpegPath(), "-y",
            "-i", plainManifest.toString(),
            "-c", "copy",
            "-f", "hls",
            "-hls_time", String.valueOf(properties.getHlsSegmentSeconds()),
            "-hls_playlist_type", "vod",
            "-hls_key_info_file", keyInfo.toString(),
            "-hls_segment_filename", tierDir.resolve("segment_%03d.ts").toString(),
            encryptedManifest.toString()
        );
        runFfmpeg(args);
    }

    // True multi-rendition master playlist with one STREAM-INF per tier
    // plus the audio + subtitle MEDIA groups from Feature 3. Replaces the
    // single-tier master written by generateTrueMasterPlaylist().
    public void generateLadderMasterPlaylist(UUID assetId, List<LadderTier> tiers) throws IOException {
        Path drmDir = assetDir(assetId).resolve("drm");
        Files.createDirectories(drmDir);

        StringBuilder sb = new StringBuilder(512);
        sb.append("#EXTM3U\n");
        sb.append("#EXT-X-VERSION:6\n");
        sb.append("#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID=\"aud0\",NAME=\"English\",LANGUAGE=\"en\",DEFAULT=YES,AUTOSELECT=YES,CHANNELS=\"2\"\n");
        sb.append("#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID=\"aud0\",NAME=\"Espanol\",LANGUAGE=\"es\",AUTOSELECT=YES,CHANNELS=\"2\",URI=\"audio_es/playlist.m3u8\"\n");
        sb.append("#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID=\"subs\",NAME=\"English\",LANGUAGE=\"en\",DEFAULT=YES,AUTOSELECT=YES,URI=\"subs/en/playlist.m3u8\"\n");
        sb.append("#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID=\"subs\",NAME=\"Espanol\",LANGUAGE=\"es\",AUTOSELECT=YES,URI=\"subs/es/playlist.m3u8\"\n");
        for (LadderTier t : tiers) {
            int totalBw = (t.vBitrateKbps() + t.aBitrateKbps()) * 1000;
            sb.append("#EXT-X-STREAM-INF:BANDWIDTH=").append(totalBw)
              .append(",CODECS=\"avc1.42c01e,mp4a.40.2\"")
              .append(",RESOLUTION=").append(t.width()).append('x').append(t.height())
              .append(",AUDIO=\"aud0\",SUBTITLES=\"subs\"\n");
            sb.append(t.label()).append("/program.m3u8\n");
        }
        Files.writeString(drmDir.resolve("multi-master.m3u8"), sb.toString());
    }

    // Forensic watermark variant. Re-encode the raw input at the top
    // tier's resolution + bitrate with a small colored patch in a known
    // position. The patch is small (8x8 px) so it's barely visible but
    // detectable by frame analysis — the per-session A/B stitching at
    // playback time emits a unique sequence that ties a leaked stream
    // back to its viewer.
    public Path generateWatermarkVariant(UUID assetId, Path rawInput, String label,
                                          int boxX, int boxY, String color,
                                          LadderTier topTier) throws IOException {
        Path outDir = assetDir(assetId).resolve("transcoded");
        Files.createDirectories(outDir);
        Path output = outDir.resolve("wm_" + label + ".mp4");

        List<String> args = List.of(
            properties.getFfmpegPath(), "-y",
            "-i", rawInput.toString(),
            "-vf", "scale=" + topTier.width() + ":" + topTier.height()
                    + ",drawbox=x=" + boxX + ":y=" + boxY + ":w=8:h=8:color=" + color + ":t=fill",
            "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
            "-b:v", topTier.vBitrateKbps() + "k",
            "-maxrate", (int) (topTier.vBitrateKbps() * 1.07) + "k",
            "-bufsize", (topTier.vBitrateKbps() * 2) + "k",
            "-c:a", "aac", "-b:a", topTier.aBitrateKbps() + "k",
            "-movflags", "+faststart",
            output.toString()
        );
        runFfmpeg(args);
        return output;
    }

    // Probe both duration and resolution from a single ffmpeg -i call.
    // Returns (durationMillis, width, height); width=0/height=0 means
    // ffmpeg's stderr didn't carry a Video stream line (audio-only input).
    public ProbeResult probe(Path input) throws IOException {
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
        String stderr = new String(output);

        Matcher dm = Pattern.compile("Duration:\\s+(\\d+):(\\d+):(\\d+(?:\\.\\d+)?)").matcher(stderr);
        if (!dm.find()) throw new IOException("could not parse duration");
        int h = Integer.parseInt(dm.group(1));
        int mn = Integer.parseInt(dm.group(2));
        double s = Double.parseDouble(dm.group(3));
        long durationMs = (long) ((h * 3600 + mn * 60 + s) * 1000);

        int width = 0;
        int height = 0;
        // Example match: "Stream #0:0[0x1](und): Video: h264 ... yuv420p(...), 640x360 [SAR 1:1 DAR 16:9]..."
        Matcher rm = Pattern.compile("Video:[^\\n]*?\\s(\\d{2,5})x(\\d{2,5})").matcher(stderr);
        if (rm.find()) {
            width = Integer.parseInt(rm.group(1));
            height = Integer.parseInt(rm.group(2));
        }
        return new ProbeResult(durationMs, width, height);
    }

    public record ProbeResult(long durationMs, int width, int height) {
        public java.time.Duration duration() { return java.time.Duration.ofMillis(durationMs); }
    }

    // VMAF perceptual quality score for a single rendition against the
    // source. The distorted stream is upscaled to source resolution before
    // comparison; libvmaf's harmonic-mean pool penalizes the worst frames
    // more heavily, which is what subscribers actually notice.
    public java.math.BigDecimal computeVmaf(Path distorted, Path reference, int refW, int refH) throws IOException {
        List<String> args = List.of(
            properties.getFfmpegPath(),
            "-i", distorted.toString(),
            "-i", reference.toString(),
            "-lavfi",
            "[0:v]scale=" + refW + ":" + refH + ":flags=bicubic[d];"
                + "[d][1:v]libvmaf=pool=harmonic_mean:n_threads=4",
            "-f", "null", "-"
        );
        ProcessBuilder pb = new ProcessBuilder(args).redirectErrorStream(true);
        Process p = pb.start();
        byte[] output;
        try {
            output = p.getInputStream().readAllBytes();
            boolean done = p.waitFor(5, TimeUnit.MINUTES);
            if (!done) {
                p.destroyForcibly();
                throw new IOException("vmaf timed out");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("vmaf interrupted", e);
        }
        String stderr = new String(output);
        // Filter prints the final score as "VMAF score: 78.65". libvmaf
        // versions vary slightly in capitalisation, so the regex is liberal.
        Matcher m = Pattern.compile("VMAF\\s+score:\\s+([0-9.]+)", Pattern.CASE_INSENSITIVE).matcher(stderr);
        if (!m.find()) {
            String tail = stderr.length() > 800 ? stderr.substring(stderr.length() - 800) : stderr;
            throw new IOException("could not parse VMAF score; tail=" + tail);
        }
        return new java.math.BigDecimal(m.group(1)).setScale(2, java.math.RoundingMode.HALF_UP);
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
        int thumbW = 160;
        int thumbH = 90;
        int cols = 10;

        int durationSec = Math.max(1, (int) duration.getSeconds());
        // Adaptive interval: very short clips (a 4 s smoke video) would
        // generate ZERO frames under a fixed 10 s interval — fps=1/10 emits
        // a frame only at every 10 s boundary, and ffmpeg then fails the
        // mjpeg encoder init with "No filtered frames for output stream".
        // Cap interval at duration/4 so any clip ≥ 4 s gets at least 4 frames.
        int intervalSec = Math.max(1, Math.min(10, durationSec / 4));
        int nThumbs = Math.max(1, (durationSec + intervalSec - 1) / intervalSec);
        int rows = Math.max(1, (nThumbs + cols - 1) / cols);

        List<String> args = List.of(
            properties.getFfmpegPath(), "-y",
            "-i", mp4.toString(),
            // format=yuvj420p converts to full-range YUV — mjpeg in ffmpeg 8.x
            // refuses the limited-range yuv420p the libx264 mezzanines carry
            // ("Non full-range YUV is non-standard") and the encoder init fails.
            "-vf", "fps=1/" + intervalSec + ",scale=" + thumbW + ":" + thumbH
                    + ",tile=" + cols + "x" + rows + ",format=yuvj420p",
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
