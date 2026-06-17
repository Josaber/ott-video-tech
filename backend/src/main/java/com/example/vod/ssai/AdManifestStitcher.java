package com.example.vod.ssai;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Stitches ad HLS segments (absolute URLs pointing at the ad-service) in front
 * of a program HLS manifest. The result has:
 *
 *   #EXT-X-DATERANGE for the ad,
 *   ad segments (cleartext, absolute URLs),
 *   #EXT-X-DISCONTINUITY,
 *   the program section with its own #EXT-X-KEY (AES-128).
 *
 * The ad section comes before any #EXT-X-KEY line so the ad stays in the
 * clear; the program section's #EXT-X-KEY survives the stitching unchanged.
 */
@Component
public class AdManifestStitcher {

    private final RestClient restClient;

    public AdManifestStitcher(RestClient restClient) {
        this.restClient = restClient;
    }

    public String stitchFromUrl(String adManifestUrl,
                                Path programManifest,
                                StitchOptions options) throws IOException {
        String adBody = restClient.get().uri(adManifestUrl).retrieve().body(String.class);
        if (adBody == null) throw new IOException("empty ad manifest from " + adManifestUrl);
        String programBody = Files.readString(programManifest);
        return stitch(adBody, adManifestUrl, programBody, options);
    }

    public String stitch(String adManifestBody,
                         String adManifestUrl,
                         String programManifestBody,
                         StitchOptions options) {
        AdSegments ad = parseAdSegments(adManifestBody, adManifestUrl);
        ProgramBody program = stripProgramHeader(programManifestBody);

        int targetDuration = Math.max(ad.targetDuration, program.targetDuration);

        StringBuilder out = new StringBuilder();
        out.append("#EXTM3U\n");
        out.append("#EXT-X-VERSION:6\n");
        out.append("#EXT-X-PLAYLIST-TYPE:VOD\n");
        out.append("#EXT-X-TARGETDURATION:").append(targetDuration).append('\n');
        out.append("#EXT-X-MEDIA-SEQUENCE:0\n");
        out.append("#EXT-X-DATERANGE:ID=\"demo-preroll\"")
           .append(",START-DATE=\"1970-01-01T00:00:00.000Z\"")
           .append(",DURATION=").append(ad.totalDurationSeconds)
           .append(",X-AD-ID=\"").append(options.adId).append("\"\n");

        out.append("#EXT-X-KEY:METHOD=NONE\n");

        for (AdSegment s : ad.segments) {
            out.append("#EXTINF:").append(formatDuration(s.duration)).append(",\n");
            out.append(s.absoluteUrl).append('\n');
        }

        out.append("#EXT-X-DISCONTINUITY\n");
        out.append(program.tailWithProgramKey);
        if (!program.tailWithProgramKey.endsWith("\n")) out.append('\n');
        return out.toString();
    }

    public record StitchOptions(String adId) {}

    public static AdSegments parseAdSegments(String body, String adManifestUrl) {
        List<AdSegment> segments = new ArrayList<>();
        int targetDuration = 0;
        double pendingDuration = 0;
        String baseUrl = stripFilename(adManifestUrl);

        for (String raw : body.split("\\R")) {
            String line = raw.trim();
            if (line.isEmpty()) continue;
            if (line.startsWith("#EXT-X-TARGETDURATION:")) {
                targetDuration = Integer.parseInt(line.substring("#EXT-X-TARGETDURATION:".length()).trim());
            } else if (line.startsWith("#EXTINF:")) {
                String value = line.substring("#EXTINF:".length());
                int comma = value.indexOf(',');
                String num = comma >= 0 ? value.substring(0, comma) : value;
                pendingDuration = Double.parseDouble(num.trim());
            } else if (!line.startsWith("#")) {
                String absolute = line.startsWith("http") ? line : baseUrl + line;
                segments.add(new AdSegment(absolute, pendingDuration));
                pendingDuration = 0;
            }
        }
        double total = segments.stream().mapToDouble(s -> s.duration).sum();
        if (targetDuration == 0 && !segments.isEmpty()) {
            targetDuration = (int) Math.ceil(segments.stream().mapToDouble(s -> s.duration).max().orElse(2));
        }
        return new AdSegments(segments, targetDuration, total);
    }

    public static ProgramBody stripProgramHeader(String body) {
        List<String> tail = new ArrayList<>();
        boolean pastHeader = false;
        int targetDuration = 0;
        for (String raw : body.split("\\R")) {
            String line = raw;
            if (line.startsWith("#EXT-X-TARGETDURATION:")) {
                targetDuration = Integer.parseInt(line.substring("#EXT-X-TARGETDURATION:".length()).trim());
                continue;
            }
            if (line.startsWith("#EXTM3U") || line.startsWith("#EXT-X-VERSION") ||
                line.startsWith("#EXT-X-PLAYLIST-TYPE") || line.startsWith("#EXT-X-MEDIA-SEQUENCE")) {
                continue;
            }
            if (line.startsWith("#EXT-X-KEY") || line.startsWith("#EXTINF") || (!line.startsWith("#") && !line.isBlank())) {
                pastHeader = true;
            }
            if (pastHeader) {
                tail.add(line);
            }
        }
        return new ProgramBody(String.join("\n", tail), targetDuration);
    }

    private static String stripFilename(String url) {
        int slash = url.lastIndexOf('/');
        return slash >= 0 ? url.substring(0, slash + 1) : url;
    }

    private static String formatDuration(double d) {
        return String.format(java.util.Locale.ROOT, "%.3f", d);
    }

    public record AdSegments(List<AdSegment> segments, int targetDuration, double totalDurationSeconds) {}
    public record AdSegment(String absoluteUrl, double duration) {}
    public record ProgramBody(String tailWithProgramKey, int targetDuration) {}
}
