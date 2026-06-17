package com.example.adservice.service;

import com.example.adservice.config.AdProperties;
import com.example.adservice.config.AdProperties.AdEntry;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AdMediaGenerator {

    private static final Logger log = LoggerFactory.getLogger(AdMediaGenerator.class);

    private final AdProperties properties;
    private final ConcurrentHashMap<String, Object> locks = new ConcurrentHashMap<>();

    public AdMediaGenerator(AdProperties properties) {
        this.properties = properties;
    }

    public Path adDir(String adId) {
        return Paths.get(properties.getOutputDir(), adId).toAbsolutePath().normalize();
    }

    public Path masterManifest(String adId) {
        return adDir(adId).resolve("master.m3u8");
    }

    public Path segment(String adId, String filename) {
        return adDir(adId).resolve(filename);
    }

    public Path mp4(String adId) {
        return adDir(adId).resolve("ad.mp4");
    }

    public void ensureGenerated(AdEntry ad) throws IOException {
        Object lock = locks.computeIfAbsent(ad.getId(), k -> new Object());
        synchronized (lock) {
            Path manifest = masterManifest(ad.getId());
            Path hashFile = adDir(ad.getId()).resolve(".config-hash");
            String currentHash = configHash(ad);
            if (Files.exists(manifest) && Files.exists(hashFile)
                    && currentHash.equals(Files.readString(hashFile).trim())) {
                return;
            }
            // config changed (or first run) — wipe stale segments before regenerating
            // so an old longer-duration ad doesn't leave segments behind a shorter one.
            if (Files.exists(adDir(ad.getId()))) {
                wipeDir(adDir(ad.getId()));
            }
            generate(ad);
            Files.writeString(hashFile, currentHash);
        }
    }

    private void generate(AdEntry ad) throws IOException {
        Path dir = adDir(ad.getId());
        Files.createDirectories(dir);

        Path mp4 = mp4(ad.getId());
        runFfmpeg(buildMp4Args(ad, mp4));

        Path manifest = masterManifest(ad.getId());
        runFfmpeg(buildHlsArgs(mp4, manifest));

        log.info("generated ad {} at {}", ad.getId(), dir);
    }

    private static String configHash(AdEntry ad) {
        int h = Objects.hash(
            ad.getDurationSeconds(),
            ad.getPrimaryColor(),
            ad.getAccentColor(),
            ad.getTagline(),
            ad.getAudioFrequency()
        );
        return Integer.toHexString(h);
    }

    private static void wipeDir(Path dir) throws IOException {
        try (Stream<Path> walk = Files.walk(dir)) {
            walk.sorted(Comparator.reverseOrder()).forEach(p -> {
                try { Files.deleteIfExists(p); } catch (IOException ignored) {}
            });
        }
    }

    private List<String> buildMp4Args(AdEntry ad, Path mp4) {
        String filter = String.format(
            "color=c=%s:s=1280x720:d=%d:r=30,"
            + "drawbox=x=0:y=300:w=1280:h=120:color=%s@0.85:t=fill,"
            + "drawtext=text='%s':fontcolor=white:fontsize=72:x=(w-text_w)/2:y=320,"
            + "drawtext=text='DEMO AD %ds':fontcolor=white:fontsize=36:x=(w-text_w)/2:y=420",
            ad.getPrimaryColor(),
            ad.getDurationSeconds(),
            ad.getAccentColor(),
            sanitize(ad.getTagline()),
            ad.getDurationSeconds()
        );

        List<String> args = new ArrayList<>();
        args.add(properties.getFfmpegPath());
        args.add("-y");
        args.add("-f"); args.add("lavfi");
        args.add("-i"); args.add(filter);
        args.add("-f"); args.add("lavfi");
        args.add("-i"); args.add(String.format(
            "sine=frequency=%d:sample_rate=48000:duration=%d",
            ad.getAudioFrequency(), ad.getDurationSeconds()));
        args.add("-c:v"); args.add("libx264");
        args.add("-preset"); args.add("ultrafast");
        args.add("-pix_fmt"); args.add("yuv420p");
        args.add("-c:a"); args.add("aac");
        args.add("-b:a"); args.add("128k");
        args.add("-shortest");
        args.add("-movflags"); args.add("+faststart");
        args.add(mp4.toString());
        return args;
    }

    private List<String> buildHlsArgs(Path mp4, Path manifest) {
        List<String> args = new ArrayList<>();
        args.add(properties.getFfmpegPath());
        args.add("-y");
        args.add("-i"); args.add(mp4.toString());
        args.add("-c"); args.add("copy");
        args.add("-f"); args.add("hls");
        args.add("-hls_time"); args.add(String.valueOf(properties.getSegmentDurationSeconds()));
        args.add("-hls_playlist_type"); args.add("vod");
        args.add("-hls_segment_filename");
        args.add(manifest.getParent().resolve("segment_%03d.ts").toString());
        args.add(manifest.toString());
        return args;
    }

    private void runFfmpeg(List<String> args) throws IOException {
        log.debug("running ffmpeg: {}", String.join(" ", args));
        ProcessBuilder pb = new ProcessBuilder(args).redirectErrorStream(true);
        Process p = pb.start();
        try {
            byte[] out = p.getInputStream().readAllBytes();
            boolean done = p.waitFor(120, TimeUnit.SECONDS);
            if (!done) {
                p.destroyForcibly();
                throw new IOException("ffmpeg timed out");
            }
            if (p.exitValue() != 0) {
                throw new IOException("ffmpeg failed: " + new String(out));
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("ffmpeg interrupted", e);
        }
    }

    private static String sanitize(String s) {
        return s.replace("'", "").replace(":", " ").replace("\\", "");
    }
}
