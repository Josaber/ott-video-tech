package com.example.vod.web;

import com.example.vod.config.SsaiProperties;
import com.example.vod.domain.VideoAssetEntity;
import com.example.vod.media.FfmpegMediaProcessor;
import com.example.vod.repository.VideoAssetRepository;
import com.example.vod.service.LicenseUrlSigner;
import com.example.vod.service.LicenseUrlSigner.SignedLicense;
import com.example.vod.service.NonceStore;
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

    // Capture the optional path prefix in front of license.key so the
    // rewritten URI preserves e.g. "../" for per-tier variant playlists
    // that live one directory deep under drm/.
    private static final Pattern KEY_URI = Pattern.compile("URI=\"([^\"]*?)license\\.key(?:\\?[^\"]*)?\"");

    private final VideoAssetRepository assets;
    private final FfmpegMediaProcessor ffmpeg;
    private final AdManifestStitcher stitcher;
    private final SsaiProperties ssaiProperties;
    private final LicenseUrlSigner signer;
    private final NonceStore nonceStore;
    private final com.example.vod.service.CdnUrlSigner cdnSigner;

    public PlaybackController(VideoAssetRepository assets,
                              FfmpegMediaProcessor ffmpeg,
                              AdManifestStitcher stitcher,
                              SsaiProperties ssaiProperties,
                              LicenseUrlSigner signer,
                              NonceStore nonceStore,
                              com.example.vod.service.CdnUrlSigner cdnSigner) {
        this.assets = assets;
        this.ffmpeg = ffmpeg;
        this.stitcher = stitcher;
        this.ssaiProperties = ssaiProperties;
        this.signer = signer;
        this.nonceStore = nonceStore;
        this.cdnSigner = cdnSigner;
    }

    /**
     * Rewrite each `segment_NNN.ts` reference in the variant playlist to an
     * absolute signed CDN URL. Skips lines that already contain `://`
     * (e.g., the ad-service ts URLs the SSAI stitcher injected). No-op
     * unless app.cdn.public-base-url is set.
     */
    private String rewriteSegmentsToCdn(String body, UUID assetId, String tier) {
        if (!cdnSigner.enabled()) return body;
        StringBuilder out = new StringBuilder(body.length() + 128);
        for (String line : body.split("\n", -1)) {
            String trimmed = line.trim();
            if (trimmed.matches("segment_\\d{3}\\.ts")) {
                String path = assetId + "/" + tier + "/" + trimmed;
                out.append(cdnSigner.sign(path)).append('\n');
            } else {
                out.append(line).append('\n');
            }
        }
        // strip one trailing newline we added back at the end.
        if (out.length() > 0 && out.charAt(out.length() - 1) == '\n') out.setLength(out.length() - 1);
        return out.toString();
    }

    @GetMapping(value = "/{assetId}/master.m3u8", produces = "application/vnd.apple.mpegurl")
    public ResponseEntity<String> master(@PathVariable UUID assetId,
                                          @AuthenticationPrincipal Jwt jwt) throws IOException {
        // True master playlist with AUDIO + SUBTITLES groups and one
        // STREAM-INF pointing at program.m3u8 (the SSAI-stitched + license-
        // rewritten variant). Pre-existing assets that were published before
        // multi-track support won't have the file — fall back to the program
        // playlist directly so old PUBLISHED rows keep playing.
        Path multi = ffmpeg.assetDir(assetId).resolve("drm").resolve("multi-master.m3u8");
        if (!Files.exists(multi)) {
            Path legacy = ffmpeg.assetDir(assetId).resolve("drm").resolve("master.m3u8");
            if (!Files.exists(legacy)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "asset not published yet");
            }
            return program(assetId, jwt);
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.apple.mpegurl"))
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(Files.readString(multi));
    }

    @GetMapping(value = "/{assetId}/program.m3u8", produces = "application/vnd.apple.mpegurl")
    public ResponseEntity<String> program(@PathVariable UUID assetId,
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
        Matcher m = KEY_URI.matcher(body);
        StringBuilder out = new StringBuilder(body.length());
        // appendReplacement (rather than replaceAll) so we can keep the
        // original path prefix per match — variant playlists under drm/{tier}/
        // emit "../license.key" while the single-tier flow emits "license.key".
        String query = signed.toQueryString();
        while (m.find()) {
            String prefix = m.group(1);
            m.appendReplacement(out,
                Matcher.quoteReplacement("URI=\"" + prefix + "license.key?" + query + "\""));
        }
        m.appendTail(out);
        return out.toString();
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
        // Single-use: a leaked URL is unusable on second fetch even within
        // its 10-minute TTL. Track nonces in memory with the same TTL plus
        // a small buffer so eviction always catches up before the verify
        // window does.
        if (!nonceStore.claim(nonce, signer.ttl().plusMinutes(1))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "license_url_already_used");
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

    @GetMapping(value = "/{assetId}/thumbnails.vtt", produces = "text/vtt")
    public ResponseEntity<Resource> thumbnails(@PathVariable UUID assetId) {
        Path vtt = ffmpeg.assetDir(assetId).resolve("thumbs").resolve("thumbnails.vtt");
        if (!Files.exists(vtt)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/vtt"))
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=300")
                .body(new FileSystemResource(vtt));
    }

    @GetMapping(value = "/{assetId}/sprite.jpg", produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<Resource> sprite(@PathVariable UUID assetId) {
        Path sprite = ffmpeg.assetDir(assetId).resolve("thumbs").resolve("sprite.jpg");
        if (!Files.exists(sprite)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=300")
                .body(new FileSystemResource(sprite));
    }

    @GetMapping(value = "/{assetId}/{tier:[a-z0-9]+}/program.m3u8", produces = "application/vnd.apple.mpegurl")
    public ResponseEntity<String> tierProgram(@PathVariable UUID assetId,
                                               @PathVariable String tier,
                                               @AuthenticationPrincipal Jwt jwt) throws IOException {
        VideoAssetEntity asset = assets.findById(assetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Path drmManifest = ffmpeg.assetDir(assetId).resolve("drm").resolve(tier).resolve("program.m3u8");
        if (!Files.exists(drmManifest)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "no such rendition");
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
        body = rewriteSegmentsToCdn(body, assetId, tier);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.apple.mpegurl"))
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(body);
    }

    @GetMapping("/{assetId}/{tier:[a-z0-9]+}/{filename:.+}")
    public ResponseEntity<Resource> tierSegment(@PathVariable UUID assetId,
                                                @PathVariable String tier,
                                                @PathVariable String filename) {
        if (!filename.matches("segment_\\d{3}\\.ts")) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        Path file = ffmpeg.assetDir(assetId).resolve("drm").resolve(tier).resolve(filename);
        if (!Files.exists(file)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("video/mp2t"))
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=300")
                .body(new FileSystemResource(file));
    }

    @GetMapping(value = "/{assetId}/audio_es/playlist.m3u8", produces = "application/vnd.apple.mpegurl")
    public ResponseEntity<Resource> altAudioPlaylist(@PathVariable UUID assetId) {
        Path p = ffmpeg.assetDir(assetId).resolve("audio_es").resolve("playlist.m3u8");
        if (!Files.exists(p)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.apple.mpegurl"))
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=300")
                .body(new FileSystemResource(p));
    }

    @GetMapping(value = "/{assetId}/audio_es/alt.aac")
    public ResponseEntity<Resource> altAudioSegment(@PathVariable UUID assetId) {
        Path p = ffmpeg.assetDir(assetId).resolve("audio_es").resolve("alt.aac");
        if (!Files.exists(p)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("audio/aac"))
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=300")
                .body(new FileSystemResource(p));
    }

    @GetMapping(value = "/{assetId}/subs/{lang}/playlist.m3u8", produces = "application/vnd.apple.mpegurl")
    public ResponseEntity<Resource> subsPlaylist(@PathVariable UUID assetId, @PathVariable String lang) {
        if (!lang.matches("en|es")) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        Path p = ffmpeg.assetDir(assetId).resolve("subs").resolve(lang).resolve("playlist.m3u8");
        if (!Files.exists(p)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.apple.mpegurl"))
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=300")
                .body(new FileSystemResource(p));
    }

    @GetMapping(value = "/{assetId}/subs/{lang}/cues.vtt", produces = "text/vtt")
    public ResponseEntity<Resource> subsCues(@PathVariable UUID assetId, @PathVariable String lang) {
        if (!lang.matches("en|es")) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        Path p = ffmpeg.assetDir(assetId).resolve("subs").resolve(lang).resolve("cues.vtt");
        if (!Files.exists(p)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/vtt"))
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=300")
                .body(new FileSystemResource(p));
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
