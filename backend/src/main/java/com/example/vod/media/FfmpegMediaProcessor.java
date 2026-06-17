package com.example.vod.media;

import com.example.vod.config.MediaProperties;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
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

        String keyId = HexFormat.of().formatHex(keyBytes);
        return new DrmResult(encryptedManifest, keyFile, keyId);
    }

    public record DrmResult(Path encryptedManifest, Path keyFile, String keyId) {}

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
