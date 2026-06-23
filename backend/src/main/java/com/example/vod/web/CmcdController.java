package com.example.vod.web;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * CMCD beacon collector. cdn-service forwards each segment request's
 * decoded CMCD payload here; this controller keeps the last N beacons in
 * a ring buffer for the dashboard panel to read.
 *
 * Persistence is intentionally in-memory for the demo — real deployments
 * would land these in Kafka / ClickHouse / etc. The ring keeps the table
 * bounded without a sweeper.
 */
@RestController
@RequestMapping("/api/cmcd")
public class CmcdController {

    private static final Logger log = LoggerFactory.getLogger(CmcdController.class);
    private static final int RING_SIZE = 500;

    private final Deque<Map<String, Object>> ring = new ArrayDeque<>(RING_SIZE);

    @PostMapping("/ingest")
    public ResponseEntity<Void> ingest(@RequestBody Map<String, Object> body) {
        if (body == null) return ResponseEntity.noContent().build();
        body.put("ingestedAt", Instant.now().toString());
        synchronized (ring) {
            if (ring.size() >= RING_SIZE) ring.removeFirst();
            ring.addLast(body);
        }
        log.debug("cmcd beacon ingested: {}", body.get("path"));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/recent")
    public List<Map<String, Object>> recent() {
        synchronized (ring) {
            return List.copyOf(ring);
        }
    }
}
