package com.example.vod.web;

import com.example.vod.config.SsaiProperties;
import com.example.vod.domain.VideoAssetEntity;
import com.example.vod.media.FfmpegMediaProcessor;
import com.example.vod.repository.VideoAssetRepository;
import com.example.vod.service.LicenseUrlSigner;
import com.example.vod.service.LicenseUrlSigner.SignedLicense;
import com.example.vod.ssai.AdManifestStitcher;
import com.example.vod.ssai.AdManifestStitcher.StitchOptions;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Playback delivery + the demo's signed-URL "DRM lite":
 *
 * - /master.m3u8 requires the caller's Bearer token. We use the JWT subject
 *   to mint a signed license URL bound to that viewer, asset, expiry
 *   (10 min) and a random nonce, then rewrite the manifest's #EXT-X-KEY URI
 *   to point at it.
 * - /license.key is open at the security layer (the signature IS the
 *   credential) and verifies (assetId, user, exp, nonce, sig). A leaked
 *   key URL stops working after 10 minutes and cannot be reused on another
 *   asset.
 *
 * This is NOT Widevine/FairPlay/PlayReady. There is no license server, no
 * device binding, no output protection, and the AES content key still
 * leaves the box in cleartext. It is, however, a stronger key-delivery
 * channel than the previous "any authenticated user can decrypt any
 * asset's stream indefinitely" — comparable to the Mux/Wowza signed-URL
 * pattern layered in front of AES-128.
 */
@RestController
@RequestMapping("/playback")
public class PlaybackController {

    private static final Pattern KEY_URI = Pattern.compile("URI=\"[^\"]*license\\.key[^\"]*\"");

    private final VideoAssetRepository assets;
    private final FfmpegMediaProcessor ffmpeg;
    private final AdManifestStitcher stitcher;
    private final SsaiProperties ssaiProperties;
    private final LicenseUrlSigner signer;

    public PlaybackController(VideoAssetRepository assets,
                              FfmpegMediaProcessor ffmpeg,
                              AdManifestStitcher stitcher,
                              SsaiProperties ssaiProperties,
                              LicenseUrlSigner signer) {
        this.assets = assets;
        this.ffmpeg = ffmpeg;
        this.stitcher = stitcher;
        this.ssaiProperties = ssaiProperties;
        this.signer = signer;
    }

    @GetMapping(value = "/{assetId}/master.m3u8", produces = "application/vnd.apple.mpegurl")
    public ResponseEntity<String> manifest(@PathVariable UUID assetId,
                                           @AuthenticationPrincipal Jwt jwt) throws IOException {
        VideoAssetEntity asset = assets.findById(assetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Path drmManifest = ffmpeg.assetDir(assetId).resolve("drm").resolve("master.m3u8");
        if (!Files.exists(drmManifest)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "asset not published yet");
        }

        String body;
        if (asset.getAdId() == null) {
            body = Files.readString(drmManifest);
        } else {
            String adId = asset.getAdId();
            String adManifestUrl = ssaiProperties.getAdServiceBaseUrl()
                    + "/ads/" + adId + "/master.m3u8";
            body = stitcher.stitchFromUrl(adManifestUrl, drmManifest, new StitchOptions(adId));
        }

        body = rewriteLicenseUri(body, assetId, jwt.getSubject());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.apple.mpegurl"))
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(body);
    }

    private String rewriteLicenseUri(String body, UUID assetId, String username) {
        SignedLicense signed = signer.sign(assetId, username, Instant.now().plus(signer.ttl()));
        // Relative URI; hls.js resolves against the manifest URL.
        String replacement = "URI=\"license.key?" + signed.toQueryString() + "\"";
        Matcher m = KEY_URI.matcher(body);
        return m.find() ? m.replaceFirst(Matcher.quoteReplacement(replacement)) : body;
    }

    @GetMapping("/{assetId}/license.key")
    public ResponseEntity<Resource> key(@PathVariable UUID assetId,
                                        @RequestParam(name = "user", required = false) String user,
                                        @RequestParam(name = "exp", required = false) Long exp,
                                        @RequestParam(name = "nonce", required = false) String nonce,
                                        @RequestParam(name = "sig", required = false) String sig) {
        if (user == null || exp == null || nonce == null || sig == null
                || !signer.verify(assetId, user, exp, nonce, sig)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "invalid_or_expired_license_url");
        }
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
