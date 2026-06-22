package com.example.vod.web;

import com.example.vod.live.LiveChannelService;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class LiveChannelController {

    private final LiveChannelService live;

    public LiveChannelController(LiveChannelService live) {
        this.live = live;
    }

    @GetMapping("/api/live/channels")
    public List<Map<String, Object>> list() {
        return List.of(Map.of(
            "slug", LiveChannelService.CHANNEL_SLUG,
            "name", LiveChannelService.CHANNEL_NAME,
            "description", LiveChannelService.CHANNEL_DESCRIPTION,
            "running", live.isRunning(),
            "startedAt", live.startedAt() == null ? "" : live.startedAt().toString(),
            "source", live.sourcePath() == null ? "" : live.sourcePath().getFileName().toString(),
            "manifestUrl", "/live/" + LiveChannelService.CHANNEL_SLUG + "/master.m3u8"
        ));
    }

    @PostMapping("/api/live/start")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> start() throws IOException {
        live.start();
        return ResponseEntity.ok(Map.of("running", live.isRunning(),
            "startedAt", live.startedAt() == null ? "" : live.startedAt().toString()));
    }

    @PostMapping("/api/live/stop")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> stop() {
        live.stop();
        return ResponseEntity.ok(Map.of("running", false));
    }

    @GetMapping(value = "/live/{slug}/master.m3u8", produces = "application/vnd.apple.mpegurl")
    public ResponseEntity<Resource> manifest(@PathVariable String slug) {
        if (!LiveChannelService.CHANNEL_SLUG.equals(slug)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND);
        }
        Path m = live.liveDir().resolve("master.m3u8");
        if (!Files.exists(m)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,
                "live channel not running");
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.apple.mpegurl"))
                // Manifest is a live rolling window — every fetch should see
                // a fresh list of segments; never let intermediaries cache it.
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .lastModified(Instant.now())
                .body(new FileSystemResource(m));
    }

    @GetMapping("/live/{slug}/{filename:.+}")
    public ResponseEntity<Resource> segment(@PathVariable String slug,
                                            @PathVariable String filename) {
        if (!LiveChannelService.CHANNEL_SLUG.equals(slug)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND);
        }
        if (!filename.matches("segment_\\d{6}\\.ts")) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND);
        }
        Path file = live.liveDir().resolve(filename);
        if (!Files.exists(file)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("video/mp2t"))
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=300")
                .body(new FileSystemResource(file));
    }
}
