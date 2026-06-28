package com.example.vod.web;

import com.example.vod.dto.CreateSeasonRequest;
import com.example.vod.dto.CreateSeriesRequest;
import com.example.vod.dto.SeasonResponse;
import com.example.vod.dto.SeriesResponse;
import com.example.vod.service.CatalogService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CatalogController {

    private final CatalogService catalog;

    public CatalogController(CatalogService catalog) {
        this.catalog = catalog;
    }

    @GetMapping("/series")
    public List<SeriesResponse> listSeries() {
        return catalog.listSeries().stream().map(SeriesResponse::from).toList();
    }

    @GetMapping("/series/{id}")
    public SeriesResponse getSeries(@PathVariable UUID id) {
        return SeriesResponse.from(catalog.getSeries(id));
    }

    @PostMapping("/series")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SeriesResponse> createSeries(@Valid @RequestBody CreateSeriesRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SeriesResponse.from(catalog.createSeries(req)));
    }

    @DeleteMapping("/series/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSeries(@PathVariable UUID id) {
        catalog.deleteSeries(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/series/{id}/seasons")
    public List<SeasonResponse> listSeasons(@PathVariable UUID id) {
        return catalog.listSeasons(id).stream().map(SeasonResponse::from).toList();
    }

    @PostMapping("/series/{id}/seasons")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SeasonResponse> createSeason(@PathVariable UUID id,
                                                        @Valid @RequestBody CreateSeasonRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SeasonResponse.from(catalog.createSeason(id, req)));
    }

    @DeleteMapping("/seasons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSeason(@PathVariable UUID id) {
        catalog.deleteSeason(id);
        return ResponseEntity.noContent().build();
    }
}
