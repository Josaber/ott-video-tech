package com.example.vod.web;

import com.example.vod.config.MediaProperties;
import com.example.vod.config.CdnProperties;
import com.example.vod.domain.SeasonEntity;
import com.example.vod.domain.SeriesEntity;
import com.example.vod.domain.VideoAssetEntity;
import com.example.vod.dto.AssetResponse;
import com.example.vod.dto.AssetSeriesRequest;
import com.example.vod.dto.CreateAssetRequest;
import com.example.vod.dto.JobResponse;
import com.example.vod.dto.RenditionResponse;
import com.example.vod.repository.RenditionRepository;
import com.example.vod.repository.SeasonRepository;
import com.example.vod.repository.SeriesRepository;
import com.example.vod.service.CatalogService;
import com.example.vod.service.VideoWorkflowService;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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
    private final RenditionRepository renditions;
    private final CdnProperties cdn;
    private final SeasonRepository seasons;
    private final SeriesRepository seriesRepo;
    private final CatalogService catalog;

    public VideoWorkflowController(VideoWorkflowService service,
                                    MediaProperties media,
                                    RenditionRepository renditions,
                                    CdnProperties cdn,
                                    SeasonRepository seasons,
                                    SeriesRepository seriesRepo,
                                    CatalogService catalog) {
        this.service = service;
        this.media = media;
        this.renditions = renditions;
        this.cdn = cdn;
        this.seasons = seasons;
        this.seriesRepo = seriesRepo;
        this.catalog = catalog;
    }

    private String cdnBase() {
        return cdn.enabled() ? cdn.getPublicBaseUrl() : "";
    }

    /**
     * Single-asset response — resolves season + series only if attached.
     * Used by endpoints that touch one asset at a time.
     */
    private AssetResponse toResponse(VideoAssetEntity asset) {
        SeasonEntity season = asset.getSeasonId() == null
                ? null
                : seasons.findById(asset.getSeasonId()).orElse(null);
        SeriesEntity series = (season == null)
                ? null
                : seriesRepo.findById(season.getSeriesId()).orElse(null);
        return AssetResponse.from(asset, media.getPublicBaseUrl(), cdnBase(), season, series);
    }

    /**
     * Batched list response: one query for distinct season IDs, one for
     * distinct series IDs, so list() stays O(1) DB calls regardless of
     * asset count.
     */
    private List<AssetResponse> toResponseList(List<VideoAssetEntity> all) {
        Set<UUID> seasonIds = new HashSet<>();
        for (VideoAssetEntity a : all) {
            if (a.getSeasonId() != null) seasonIds.add(a.getSeasonId());
        }
        Map<UUID, SeasonEntity> seasonsById = seasonIds.isEmpty()
                ? Map.of()
                : seasons.findAllById(seasonIds).stream()
                    .collect(Collectors.toMap(SeasonEntity::getId, Function.identity()));
        Set<UUID> seriesIds = seasonsById.values().stream()
                .map(SeasonEntity::getSeriesId)
                .collect(Collectors.toSet());
        Map<UUID, SeriesEntity> seriesById = seriesIds.isEmpty()
                ? Map.of()
                : seriesRepo.findAllById(seriesIds).stream()
                    .collect(Collectors.toMap(SeriesEntity::getId, Function.identity()));
        return all.stream().map(a -> {
            SeasonEntity s = (a.getSeasonId() == null) ? null : seasonsById.get(a.getSeasonId());
            SeriesEntity series = (s == null) ? null : seriesById.get(s.getSeriesId());
            return AssetResponse.from(a, media.getPublicBaseUrl(), cdnBase(), s, series);
        }).toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AssetResponse> create(@Valid @RequestBody CreateAssetRequest req) {
        var asset = service.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(asset));
    }

    @GetMapping
    public List<AssetResponse> list() {
        return toResponseList(service.list());
    }

    @GetMapping("/{id}")
    public AssetResponse get(@PathVariable UUID id) {
        return toResponse(service.get(id));
    }

    @GetMapping("/{id}/jobs")
    public List<JobResponse> jobs(@PathVariable UUID id) {
        return service.jobs(id).stream().map(JobResponse::from).toList();
    }

    @GetMapping("/{id}/renditions")
    public List<RenditionResponse> renditions(@PathVariable UUID id) {
        return renditions.findByAssetIdOrderByVideoBitrateKbpsAsc(id).stream()
                .map(RenditionResponse::from)
                .toList();
    }

    @PostMapping("/{id}/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public AssetResponse upload(@PathVariable UUID id,
                                @RequestParam("file") MultipartFile file) throws IOException {
        var asset = service.upload(id, file);
        return toResponse(asset);
    }

    @PostMapping("/{id}/process")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> process(@PathVariable UUID id) {
        service.triggerProcessing(id);
        return ResponseEntity.accepted().build();
    }

    @PutMapping("/{id}/editorial-state")
    @PreAuthorize("hasRole('ADMIN')")
    public AssetResponse transitionEditorial(@PathVariable UUID id,
                                              @RequestBody
                                              com.example.vod.dto.EditorialTransitionRequest body) {
        var asset = service.transitionEditorial(id, body.target());
        return toResponse(asset);
    }

    @PutMapping("/{id}/category")
    @PreAuthorize("hasRole('ADMIN')")
    public AssetResponse setCategory(@PathVariable UUID id,
                                      @Valid @RequestBody
                                      com.example.vod.dto.CategoryRequest body) {
        var asset = service.setCategory(id, body.category());
        return toResponse(asset);
    }

    /**
     * Attach (or detach) this asset to a season + episode. Pass null
     * seasonId to detach; episodeNumber is required when seasonId is set
     * and must be unique within the season.
     */
    @PutMapping("/{id}/series")
    @PreAuthorize("hasRole('ADMIN')")
    public AssetResponse setSeries(@PathVariable UUID id,
                                    @Valid @RequestBody AssetSeriesRequest body) {
        var asset = catalog.attachAssetToSeason(id, body.seasonId(), body.episodeNumber());
        return toResponse(asset);
    }

    /**
     * Up-next lookup: same-season episode+1, else next season's first
     * episode. 204 (No Content) when there's nothing after this asset —
     * a 404 would be ambiguous with "asset not found".
     */
    @GetMapping("/{id}/next")
    public ResponseEntity<AssetResponse> next(@PathVariable UUID id) {
        var current = service.get(id);
        return catalog.findUpNext(current)
                .map(a -> ResponseEntity.ok(toResponse(a)))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
