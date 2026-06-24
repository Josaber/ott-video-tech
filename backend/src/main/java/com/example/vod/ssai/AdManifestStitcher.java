package com.example.vod.ssai;

import com.example.vod.config.SsaiProperties;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Server-side ad stitcher with ad-pod and mid-roll support.
 *
 * Output structure:
 *
 *   #EXTM3U + standard header
 *   #EXT-X-DATERANGE:ID="preroll-pod",DURATION={sumOfPodDurations},X-AD-POD-SIZE=N
 *   #EXT-X-KEY:METHOD=NONE     ← ads are clear
 *   {ad-1 segments}
 *   {ad-2 segments}
 *   {ad-3 segments}
 *   #EXT-X-DISCONTINUITY
 *   #EXT-X-KEY:METHOD=AES-128,URI=...  ← program key
 *   {program segments up to mid-roll position}
 *   #EXT-X-DISCONTINUITY
 *   #EXT-X-DATERANGE:ID="midroll-1",DURATION={adDuration},X-AD-ID=...
 *   #EXT-X-KEY:METHOD=NONE     ← mid-roll ad is clear
 *   {mid-roll ad segments}
 *   #EXT-X-DISCONTINUITY
 *   #EXT-X-KEY:METHOD=AES-128,URI=...  ← restate program key
 *   {remaining program segments}
 *   #EXT-X-ENDLIST
 *
 * EXT-X-DATERANGE tags surface to hls.js so the player can enforce
 * "no-skip" gates per break.
 */
@Component
public class AdManifestStitcher {

    private final RestClient restClient;

    public AdManifestStitcher(RestClient restClient) {
        this.restClient = restClient;
    }

    // Legacy single-ad preroll path. Kept for callers that still pass an
    // ad id directly; new code paths should call stitchSchedule.
    public String stitchFromUrl(String adManifestUrl,
                                Path programManifest,
                                StitchOptions options) throws IOException {
        String adBody = restClient.get().uri(adManifestUrl).retrieve().body(String.class);
        if (adBody == null) throw new IOException("empty ad manifest from " + adManifestUrl);
        String programBody = Files.readString(programManifest);
        return stitch(adBody, adManifestUrl, programBody, options);
    }

    // New schedule-aware path: preroll pod + optional mid-roll.
    public String stitchSchedule(Path programManifest,
                                  SsaiProperties ssai,
                                  Function<String, String> adManifestUrlFor) throws IOException {
        String programBody = Files.readString(programManifest);

        ProgramParsed program = parseProgram(programBody);

        // Resolve which ads we actually need so each is fetched at most once.
        Set<String> needed = new LinkedHashSet<>(ssai.getPrerollPod());
        if (ssai.getMidrollAdId() != null && !ssai.getMidrollAdId().isEmpty()) {
            needed.add(ssai.getMidrollAdId());
        }
        if (needed.isEmpty()) needed.add(ssai.getAdId());  // legacy single-ad fallback
        Map<String, AdSegments> ads = new HashMap<>();
        for (String adId : needed) {
            String url = adManifestUrlFor.apply(adId);
            String body = restClient.get().uri(url).retrieve().body(String.class);
            if (body == null) throw new IOException("empty ad manifest from " + url);
            ads.put(adId, parseAdSegments(body, url));
        }

        List<String> prerollIds = ssai.getPrerollPod().isEmpty()
            ? List.of(ssai.getAdId())
            : ssai.getPrerollPod();
        double prerollPodDuration = prerollIds.stream()
            .mapToDouble(id -> ads.get(id).totalDurationSeconds)
            .sum();

        double totalProgramDuration = program.segments.stream().mapToDouble(s -> s.duration).sum();
        double midrollAtSec = totalProgramDuration * ssai.getMidrollPositionFraction();
        boolean midrollConfigured = ssai.getMidrollAdId() != null && !ssai.getMidrollAdId().isEmpty();

        int targetDuration = Math.max(program.targetDuration, ads.values().stream()
            .mapToInt(a -> a.targetDuration).max().orElse(0));

        StringBuilder out = new StringBuilder();
        out.append("#EXTM3U\n");
        out.append("#EXT-X-VERSION:6\n");
        out.append("#EXT-X-PLAYLIST-TYPE:VOD\n");
        out.append("#EXT-X-TARGETDURATION:").append(targetDuration).append('\n');
        out.append("#EXT-X-MEDIA-SEQUENCE:0\n");

        // Preroll pod
        out.append("#EXT-X-DATERANGE:ID=\"preroll-pod\"")
           .append(",START-DATE=\"1970-01-01T00:00:00.000Z\"")
           .append(",DURATION=").append(prerollPodDuration)
           .append(",X-AD-POD-SIZE=").append(prerollIds.size()).append('\n');
        out.append("#EXT-X-KEY:METHOD=NONE\n");
        for (String adId : prerollIds) {
            for (AdSegment s : ads.get(adId).segments) {
                out.append("#EXTINF:").append(formatDuration(s.duration)).append(",\n");
                out.append(s.absoluteUrl).append('\n');
            }
        }

        // Transition from preroll → program
        out.append("#EXT-X-DISCONTINUITY\n");
        if (program.keyLine != null) out.append(program.keyLine).append('\n');

        boolean midrollEmitted = !midrollConfigured;
        double elapsed = 0;
        for (ProgramSegment seg : program.segments) {
            if (!midrollEmitted && elapsed >= midrollAtSec) {
                AdSegments midrollAd = ads.get(ssai.getMidrollAdId());
                // START-DATE positions the daterange on the player's
                // timeline: preroll pod duration + program elapsed up to
                // this break = absolute time of the midroll in the stitched
                // playlist. hls.js maps START-DATE to currentTime via PDT.
                double midrollAbsoluteStart = prerollPodDuration + elapsed;
                out.append("#EXT-X-DISCONTINUITY\n");
                out.append("#EXT-X-DATERANGE:ID=\"midroll-1\"")
                   .append(",START-DATE=\"").append(formatStartDate(midrollAbsoluteStart)).append('"')
                   .append(",DURATION=").append(midrollAd.totalDurationSeconds)
                   .append(",X-AD-ID=\"").append(ssai.getMidrollAdId()).append("\"\n");
                out.append("#EXT-X-KEY:METHOD=NONE\n");
                for (AdSegment s : midrollAd.segments) {
                    out.append("#EXTINF:").append(formatDuration(s.duration)).append(",\n");
                    out.append(s.absoluteUrl).append('\n');
                }
                // Restate the program key so the remaining program segments
                // resume decryption — EXT-X-KEY only persists within a
                // continuous run, so DISCONTINUITY breaks the binding.
                out.append("#EXT-X-DISCONTINUITY\n");
                if (program.keyLine != null) out.append(program.keyLine).append('\n');
                midrollEmitted = true;
            }
            out.append("#EXTINF:").append(formatDuration(seg.duration)).append(",\n");
            out.append(seg.url).append('\n');
            elapsed += seg.duration;
        }

        out.append("#EXT-X-ENDLIST\n");
        return out.toString();
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

    public static ProgramParsed parseProgram(String body) {
        String keyLine = null;
        int targetDuration = 0;
        List<ProgramSegment> segments = new ArrayList<>();
        double pendingDuration = 0;
        for (String raw : body.split("\\R")) {
            String line = raw.trim();
            if (line.startsWith("#EXT-X-TARGETDURATION:")) {
                targetDuration = Integer.parseInt(line.substring("#EXT-X-TARGETDURATION:".length()).trim());
            } else if (line.startsWith("#EXT-X-KEY")) {
                keyLine = line;
            } else if (line.startsWith("#EXTINF:")) {
                String value = line.substring("#EXTINF:".length());
                int comma = value.indexOf(',');
                String num = comma >= 0 ? value.substring(0, comma) : value;
                pendingDuration = Double.parseDouble(num.trim());
            } else if (!line.startsWith("#") && !line.isEmpty()) {
                segments.add(new ProgramSegment(line, pendingDuration));
                pendingDuration = 0;
            }
        }
        return new ProgramParsed(keyLine, targetDuration, segments);
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

    // ISO-8601 in the "1970 epoch" namespace, used as a relative reference
    // point in our stitched timeline. hls.js maps START-DATE to currentTime.
    private static String formatStartDate(double secondsFromEpoch) {
        long h = (long) (secondsFromEpoch / 3600);
        long m = (long) ((secondsFromEpoch % 3600) / 60);
        double s = secondsFromEpoch - h * 3600 - m * 60;
        return String.format(java.util.Locale.ROOT, "1970-01-01T%02d:%02d:%06.3fZ", h, m, s);
    }

    public record AdSegments(List<AdSegment> segments, int targetDuration, double totalDurationSeconds) {}
    public record AdSegment(String absoluteUrl, double duration) {}
    public record ProgramBody(String tailWithProgramKey, int targetDuration) {}
    public record ProgramParsed(String keyLine, int targetDuration, List<ProgramSegment> segments) {}
    public record ProgramSegment(String url, double duration) {}
}
