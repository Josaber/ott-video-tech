package com.example.adservice.web;

import com.example.adservice.config.AdProperties.AdEntry;
import com.example.adservice.domain.AdCatalog;
import com.example.adservice.service.AdMediaGenerator;
import com.example.adservice.service.VastBuilder;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping
public class AdController {

    private static final Logger log = LoggerFactory.getLogger(AdController.class);

    private final AdCatalog catalog;
    private final AdMediaGenerator generator;
    private final VastBuilder vastBuilder;

    public AdController(AdCatalog catalog, AdMediaGenerator generator, VastBuilder vastBuilder) {
        this.catalog = catalog;
        this.generator = generator;
        this.vastBuilder = vastBuilder;
    }

    @GetMapping("/catalog")
    public List<Map<String, Object>> catalog() {
        return catalog.all().stream()
                .map(ad -> Map.<String, Object>of(
                        "id", ad.getId(),
                        "title", ad.getTitle(),
                        "durationSeconds", ad.getDurationSeconds(),
                        "tagline", ad.getTagline()))
                .toList();
    }

    @GetMapping(value = "/vast", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> vast(@RequestParam(value = "adId", required = false) String adId) {
        AdEntry ad = (adId == null || adId.isBlank())
                ? catalog.pickDefault()
                : catalog.find(adId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ad not found"));
        try {
            generator.ensureGenerated(ad);
        } catch (IOException e) {
            log.error("ad generation failed for {}", ad.getId(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "ad generation failed");
        }
        String xml = vastBuilder.buildVast(ad);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_XML)
                .body(xml);
    }

    @GetMapping(value = "/ads/{adId}/master.m3u8")
    public ResponseEntity<Resource> manifest(@PathVariable String adId) {
        AdEntry ad = catalog.find(adId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ad not found"));
        try {
            generator.ensureGenerated(ad);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "ad generation failed", e);
        }
        Path manifest = generator.masterManifest(adId);
        if (!Files.exists(manifest)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "manifest missing");
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.apple.mpegurl"))
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=60")
                .body(new FileSystemResource(manifest));
    }

    @GetMapping(value = "/ads/{adId}/{filename:.+}")
    public ResponseEntity<Resource> segment(@PathVariable String adId, @PathVariable String filename) {
        if (!filename.matches("segment_\\d{3}\\.ts")) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "not a segment");
        }
        AdEntry ad = catalog.find(adId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ad not found"));
        try {
            generator.ensureGenerated(ad);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "ad generation failed", e);
        }
        Path segment = generator.segment(adId, filename);
        if (!Files.exists(segment)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "segment missing");
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("video/mp2t"))
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=300")
                .body(new FileSystemResource(segment));
    }
}
