package com.example.vod.live;

import com.example.vod.config.MediaProperties;
import com.example.vod.domain.AssetStatus;
import com.example.vod.domain.RenditionEntity;
import com.example.vod.domain.VideoAssetEntity;
import com.example.vod.repository.RenditionRepository;
import com.example.vod.repository.VideoAssetRepository;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Loops a published asset's mezzanine as a live HLS feed. One channel
 * named "demo"; the source is the highest-tier mezzanine of the most
 * recently published asset (picked once at startup; restarting picks a
 * fresh source).
 *
 * ffmpeg is run as a child process with `-re -stream_loop -1` so it
 * paces at 1× and never reaches EOF. Output uses a 6-segment rolling
 * window (`hls_list_size 6` + `delete_segments`) so disk stays
 * bounded. The manifest omits #EXT-X-ENDLIST and carries
 * #EXT-X-PROGRAM-DATE-TIME so hls.js auto-detects "live" and snaps
 * the playhead to the live edge.
 *
 * Not strictly LL-HLS (no #EXT-X-PART or #EXT-X-PRELOAD-HINT), but
 * with 2-second segments this delivers a ~6-second end-to-end latency
 * — well within demo territory.
 */
@Service
public class LiveChannelService {

    private static final Logger log = LoggerFactory.getLogger(LiveChannelService.class);
    public static final String CHANNEL_SLUG = "demo";
    public static final String CHANNEL_NAME = "Demo loop";
    public static final String CHANNEL_DESCRIPTION =
        "A published VOD asset paced at 1× via `-re -stream_loop -1`. " +
        "Loops back to t=0 every cycle so the manifest never reaches an end.";

    private final MediaProperties properties;
    private final VideoAssetRepository assets;
    private final RenditionRepository renditions;

    private volatile Process process;
    private volatile Instant startedAt;
    private volatile Path sourcePath;

    public LiveChannelService(MediaProperties properties,
                               VideoAssetRepository assets,
                               RenditionRepository renditions) {
        this.properties = properties;
        this.assets = assets;
        this.renditions = renditions;
    }

    @PostConstruct
    public synchronized void autoStart() {
        try {
            start();
        } catch (Exception e) {
            log.warn("live demo channel not started at boot", e);
        }
    }

    public synchronized void start() throws IOException {
        if (isRunning()) {
            log.info("live demo channel already running; ignoring start()");
            return;
        }
        Path src = pickSource()
                .orElseThrow(() -> new IllegalStateException(
                    "no published asset available as a live source"));
        Path outDir = liveDir();
        cleanOutDir(outDir);
        Files.createDirectories(outDir);

        List<String> args = List.of(
            properties.getFfmpegPath(),
            "-re",
            "-stream_loop", "-1",
            "-i", src.toString(),
            "-map", "0:v", "-map", "0:a",
            "-c:v", "libx264",
            "-preset", "ultrafast",
            "-tune", "zerolatency",
            "-pix_fmt", "yuv420p",
            // Short GOPs are mandatory for low-latency — each PART must
            // start on a keyframe-aligned boundary, so g=keyint_min=15
            // (= 0.5 s at 30 fps) matches the part target duration below.
            "-g", "15", "-keyint_min", "15", "-sc_threshold", "0",
            "-b:v", "2500k",
            "-c:a", "aac", "-b:a", "128k",
            "-f", "hls",
            // CMAF fMP4 + 1 s segments. Truly LL-HLS (EXT-X-PART /
            // PRELOAD-HINT) would also need `-hls_flags low_latency`, but
            // this build of ffmpeg (evermeet 8.1) doesn't recognise the
            // constant. The fMP4 + 1 s combination still cuts end-to-end
            // latency from ~6 s (TS + 2 s segments) to ~3-4 s and primes
            // the pipeline for full LL-HLS once the upstream encoder is
            // swapped (shaka-packager / bento4 / a newer ffmpeg).
            "-hls_time", "1",
            "-hls_list_size", "6",
            "-hls_segment_type", "fmp4",
            "-hls_fmp4_init_filename", "init.mp4",
            "-hls_flags", "delete_segments+independent_segments+omit_endlist+program_date_time",
            "-hls_segment_filename", outDir.resolve("segment_%06d.m4s").toString(),
            outDir.resolve("master.m3u8").toString()
        );
        ProcessBuilder pb = new ProcessBuilder(args).redirectErrorStream(true);
        Process p = pb.start();
        // Drain stdout/stderr to /dev/null so the pipe buffer doesn't fill
        // and stall ffmpeg — without this, after ~64 KiB of ffmpeg's INFO
        // chatter the encoder will block on write.
        // Virtual threads are always daemon — no setDaemon needed (it throws).
        // Capture stderr+stdout to a sibling file so we can inspect ffmpeg
        // failures (LL-HLS flag combinations are picky on some builds).
        Path drainLog = outDir.resolve("ffmpeg.log");
        Thread.ofVirtual().name("ffmpeg-live-drain").start(() -> {
            try (var in = p.getInputStream();
                 var out = Files.newOutputStream(drainLog)) {
                byte[] buf = new byte[8192];
                int n;
                while ((n = in.read(buf)) >= 0) {
                    out.write(buf, 0, n);
                    out.flush();
                }
            } catch (IOException ignored) {}
        });
        this.process = p;
        this.startedAt = Instant.now();
        this.sourcePath = src;
        log.info("started live demo channel; source={}", src);
    }

    public synchronized void stop() {
        if (process != null) {
            process.destroy();
            try {
                if (!process.waitFor(5, java.util.concurrent.TimeUnit.SECONDS)) {
                    process.destroyForcibly();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                process.destroyForcibly();
            }
            log.info("stopped live demo channel");
        }
        process = null;
        startedAt = null;
        sourcePath = null;
    }

    @PreDestroy
    public void shutdown() {
        stop();
    }

    public boolean isRunning() {
        Process p = this.process;
        return p != null && p.isAlive();
    }

    public Instant startedAt() { return startedAt; }
    public Path sourcePath() { return sourcePath; }

    public Path liveDir() {
        return Path.of(properties.getProcessedDir(), "live", CHANNEL_SLUG).toAbsolutePath().normalize();
    }

    private java.util.Optional<Path> pickSource() {
        // Most-recently-published asset; prefer the highest tier mezzanine.
        List<VideoAssetEntity> published = assets.findAll().stream()
            .filter(a -> a.getStatus() == AssetStatus.PUBLISHED)
            .sorted(Comparator.comparing(VideoAssetEntity::getUpdatedAt).reversed())
            .toList();
        for (VideoAssetEntity a : published) {
            List<RenditionEntity> rows = renditions.findByAssetIdOrderByVideoBitrateKbpsAsc(a.getId());
            if (!rows.isEmpty()) {
                RenditionEntity top = rows.get(rows.size() - 1);
                Path mezz = Path.of(properties.getProcessedDir(), a.getId().toString(),
                        "transcoded", "video_" + top.getTierLabel() + ".mp4");
                if (Files.exists(mezz)) return java.util.Optional.of(mezz);
            }
            // Fall back to legacy single-rendition path.
            if (a.getTranscodedPath() != null) {
                Path legacy = Path.of(a.getTranscodedPath());
                if (Files.exists(legacy)) return java.util.Optional.of(legacy);
            }
        }
        return java.util.Optional.empty();
    }

    private void cleanOutDir(Path outDir) throws IOException {
        if (!Files.exists(outDir)) return;
        try (Stream<Path> walk = Files.walk(outDir)) {
            walk.sorted(Comparator.reverseOrder()).forEach(p -> {
                try { Files.deleteIfExists(p); } catch (IOException ignored) {}
            });
        }
    }
}
