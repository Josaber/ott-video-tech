package com.example.vod.web;

import com.example.vod.config.MediaProperties;
import com.example.vod.dto.AssetResponse;
import com.example.vod.dto.CreateAssetRequest;
import com.example.vod.dto.JobResponse;
import com.example.vod.service.VideoWorkflowService;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/videos")
public class VideoWorkflowController {

    private final VideoWorkflowService service;
    private final MediaProperties media;

    public VideoWorkflowController(VideoWorkflowService service, MediaProperties media) {
        this.service = service;
        this.media = media;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AssetResponse> create(@Valid @RequestBody CreateAssetRequest req) {
        var asset = service.create(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(AssetResponse.from(asset, media.getPublicBaseUrl()));
    }

    @GetMapping
    public List<AssetResponse> list() {
        return service.list().stream()
                .map(a -> AssetResponse.from(a, media.getPublicBaseUrl()))
                .toList();
    }

    @GetMapping("/{id}")
    public AssetResponse get(@PathVariable UUID id) {
        return AssetResponse.from(service.get(id), media.getPublicBaseUrl());
    }

    @GetMapping("/{id}/jobs")
    public List<JobResponse> jobs(@PathVariable UUID id) {
        return service.jobs(id).stream().map(JobResponse::from).toList();
    }

    @PostMapping("/{id}/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public AssetResponse upload(@PathVariable UUID id,
                                @RequestParam("file") MultipartFile file) throws IOException {
        var asset = service.upload(id, file);
        return AssetResponse.from(asset, media.getPublicBaseUrl());
    }

    @PostMapping("/{id}/process")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> process(@PathVariable UUID id) {
        service.triggerProcessing(id);
        return ResponseEntity.accepted().build();
    }
}
