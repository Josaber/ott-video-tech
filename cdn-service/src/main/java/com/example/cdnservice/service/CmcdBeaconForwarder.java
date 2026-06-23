package com.example.cdnservice.service;

import com.example.cdnservice.config.CdnProperties;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Parses CMCD parameters off the query string (CTA-5004 query-mode encoding,
 * which is what hls.js emits when configured with `cmcd: { useHeaders: false }`)
 * and POSTs a JSON beacon to the origin backend's collector.
 *
 * Failure to forward is logged but never blocks the segment response — the
 * player should keep playing even if our collector is down.
 */
@Component
public class CmcdBeaconForwarder {

    private static final Logger log = LoggerFactory.getLogger(CmcdBeaconForwarder.class);

    private final CdnProperties properties;
    private final RestClient restClient;

    public CmcdBeaconForwarder(CdnProperties properties, RestClient restClient) {
        this.properties = properties;
        this.restClient = restClient;
    }

    public Map<String, Object> parseCmcd(String cmcdRaw) {
        if (cmcdRaw == null || cmcdRaw.isEmpty()) return Map.of();
        Map<String, Object> kv = new HashMap<>();
        // CMCD pairs are comma-separated; values may be quoted strings or
        // bare tokens. The parser is intentionally forgiving — we want
        // observability, not strict CTA-5004 validation.
        for (String pair : cmcdRaw.split(",")) {
            int eq = pair.indexOf('=');
            if (eq < 0) {
                kv.put(pair.trim(), Boolean.TRUE);
            } else {
                String k = pair.substring(0, eq).trim();
                String v = pair.substring(eq + 1).trim();
                if (v.startsWith("\"") && v.endsWith("\"") && v.length() >= 2) {
                    v = v.substring(1, v.length() - 1);
                }
                // Numeric where possible — easier to aggregate downstream.
                try { kv.put(k, Long.parseLong(v)); continue; } catch (NumberFormatException ignored) {}
                try { kv.put(k, Double.parseDouble(v)); continue; } catch (NumberFormatException ignored) {}
                kv.put(k, v);
            }
        }
        return kv;
    }

    public void forward(String path, Map<String, Object> cmcd) {
        if (cmcd == null || cmcd.isEmpty()) return;
        Map<String, Object> body = new HashMap<>();
        body.put("path", path);
        body.put("timestamp", System.currentTimeMillis());
        body.put("cmcd", cmcd);
        try {
            restClient.post()
                .uri(properties.getCmcdSinkUrl())
                .body(body)
                .retrieve()
                .toBodilessEntity();
        } catch (Exception e) {
            log.debug("CMCD beacon forward failed: {}", e.getMessage());
        }
    }
}
