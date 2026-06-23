package com.example.cdnservice.web;

import com.example.cdnservice.config.CdnProperties;
import com.example.cdnservice.service.CdnUrlVerifier;
import com.example.cdnservice.service.CmcdBeaconForwarder;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletResponse;

/**
 * Edge surface: /cdn/{assetId}/{path...}?exp=...&sig=...&CMCD=...
 *
 * Flow per request:
 *   1. Reject if exp is in the past or sig doesn't verify.
 *   2. Forward CMCD query payload to origin's collector (best-effort).
 *   3. Stream the segment back from the origin /playback/ endpoint.
 *
 * The proxy is intentionally dumb — no caching, no range support, no
 * transformations. A real CDN edge would cache, do byte-range requests,
 * and short-circuit auth, but those aren't what the demo is teaching.
 */
@RestController
@RequestMapping("/cdn")
public class CdnEdgeController {

    private static final Logger log = LoggerFactory.getLogger(CdnEdgeController.class);

    private final CdnProperties properties;
    private final CdnUrlVerifier verifier;
    private final CmcdBeaconForwarder cmcd;

    public CdnEdgeController(CdnProperties properties,
                              CdnUrlVerifier verifier,
                              CmcdBeaconForwarder cmcd) {
        this.properties = properties;
        this.verifier = verifier;
        this.cmcd = cmcd;
    }

    @GetMapping("/{assetId}/**")
    public void edge(@PathVariable String assetId,
                     @RequestParam("exp") long exp,
                     @RequestParam("sig") String sig,
                     @RequestParam(value = "CMCD", required = false) String cmcdRaw,
                     jakarta.servlet.http.HttpServletRequest request,
                     HttpServletResponse response) throws IOException {
        // Reconstruct the path inside /cdn/ — e.g. "5da5441e/360p/segment_000.ts".
        String fullUri = request.getRequestURI();      // /cdn/{assetId}/...
        String path = fullUri.substring("/cdn/".length());
        // Hand-decoded so we don't trip on raw `+` in CMCD values (some
        // clients encode space as `+`; we just leave it alone for now).
        if (!verifier.verify(path, exp, sig)) {
            log.info("REJECT {} (exp={}, sig=...): bad-signature-or-expired", path, exp);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "invalid_or_expired_token");
        }

        // CMCD: forward to the origin's collector. Decode once — query
        // params from Spring are already decoded but the CMCD value may
        // contain comma-separated KV which our forwarder parses itself.
        if (cmcdRaw != null && !cmcdRaw.isEmpty()) {
            try {
                String decoded = URLDecoder.decode(cmcdRaw, StandardCharsets.UTF_8);
                var parsed = cmcd.parseCmcd(decoded);
                log.info("CMCD {} {}", path, parsed);
                cmcd.forward(path, parsed);
            } catch (Exception e) {
                log.debug("CMCD parse failed: {}", e.getMessage());
            }
        } else {
            log.info("HIT  {}", path);
        }

        // Stream the segment from origin. We use HttpURLConnection rather
        // than RestClient.get().body(InputStream.class) so we can stream
        // through to the client without buffering the whole segment in RAM.
        String originUrl = properties.getOriginBaseUrl() + "/" + path;
        URI uri = URI.create(originUrl);
        HttpURLConnection conn = (HttpURLConnection) uri.toURL().openConnection();
        conn.setRequestMethod("GET");
        conn.setConnectTimeout(5_000);
        conn.setReadTimeout(30_000);
        conn.setInstanceFollowRedirects(true);

        int upstream = conn.getResponseCode();
        if (upstream >= 400) {
            response.setStatus(upstream);
            try (InputStream errIn = conn.getErrorStream()) {
                if (errIn != null) errIn.transferTo(OutputStream.nullOutputStream());
            }
            log.info("MISS {} origin returned {}", path, upstream);
            return;
        }

        String ct = conn.getContentType();
        response.setStatus(HttpStatus.OK.value());
        response.setContentType(ct != null ? ct : MediaType.APPLICATION_OCTET_STREAM_VALUE);
        if (conn.getContentLengthLong() > 0) {
            response.setContentLengthLong(conn.getContentLengthLong());
        }
        // Long-lived cache: a real edge would honour these for /segment/*.
        response.setHeader("Cache-Control", "public, max-age=300");
        response.setHeader("X-Cdn-Mock", "edge=demo");
        try (InputStream in = conn.getInputStream(); OutputStream out = response.getOutputStream()) {
            in.transferTo(out);
        }
    }
}
