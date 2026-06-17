package com.example.vod.web;

import com.example.vod.config.MediaProperties;
import com.example.vod.config.SsaiProperties;
import com.example.vod.domain.VideoAssetEntity;
import com.example.vod.media.FfmpegMediaProcessor;
import com.example.vod.repository.VideoAssetRepository;
import com.example.vod.ssai.AdManifestStitcher;
import com.example.vod.ssai.AdManifestStitcher.StitchOptions;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/playback")
public class PlaybackController {

    private final VideoAssetRepository assets;
    private final FfmpegMediaProcessor ffmpeg;
    private final AdManifestStitcher stitcher;
    private final SsaiProperties ssaiProperties;
    private final MediaProperties media;

    public PlaybackController(VideoAssetRepository assets,
                              FfmpegMediaProcessor ffmpeg,
                              AdManifestStitcher stitcher,
                              SsaiProperties ssaiProperties,
                              MediaProperties media) {
        this.assets = assets;
        this.ffmpeg = ffmpeg;
        this.stitcher = stitcher;
        this.ssaiProperties = ssaiProperties;
        this.media = media;
    }

    @GetMapping(value = "/{assetId}/master.m3u8", produces = "application/vnd.apple.mpegurl")
    public ResponseEntity<String> manifest(@PathVariable UUID assetId) throws IOException {
        VideoAssetEntity asset = assets.findById(assetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Path drmManifest = ffmpeg.assetDir(assetId).resolve("drm").resolve("master.m3u8");
        if (!Files.exists(drmManifest)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "asset not published yet");
        }
        String adId = asset.getAdId() != null ? asset.getAdId() : ssaiProperties.getAdId();
        String adManifestUrl = ssaiProperties.getAdServiceBaseUrl() + "/ads/" + adId + "/master.m3u8";

        String stitched = stitcher.stitchFromUrl(adManifestUrl, drmManifest, new StitchOptions(adId));

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.apple.mpegurl"))
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(stitched);
    }

    @GetMapping("/{assetId}/license.key")
    public ResponseEntity<Resource> key(@PathVariable UUID assetId) {
        Path key = ffmpeg.assetDir(assetId).resolve("drm").resolve("license.key");
        if (!Files.exists(key)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(new FileSystemResource(key));
    }

    @GetMapping("/{assetId}/{filename:.+}")
    public ResponseEntity<Resource> segment(@PathVariable UUID assetId,
                                            @PathVariable String filename) {
        if (!filename.matches("segment_\\d{3}\\.ts")) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        Path file = ffmpeg.assetDir(assetId).resolve("drm").resolve(filename);
        if (!Files.exists(file)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("video/mp2t"))
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=300")
                .body(new FileSystemResource(file));
    }
}
