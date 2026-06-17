package com.example.vod;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.vod.ssai.AdManifestStitcher;
import com.example.vod.ssai.AdManifestStitcher.StitchOptions;
import org.junit.jupiter.api.Test;

class AdManifestStitcherTest {

    private static final String AD_MANIFEST = """
        #EXTM3U
        #EXT-X-VERSION:3
        #EXT-X-TARGETDURATION:2
        #EXT-X-MEDIA-SEQUENCE:0
        #EXT-X-PLAYLIST-TYPE:VOD
        #EXTINF:2.000,
        segment_000.ts
        #EXTINF:2.000,
        segment_001.ts
        #EXTINF:1.000,
        segment_002.ts
        #EXT-X-ENDLIST
        """;

    private static final String PROGRAM_MANIFEST = """
        #EXTM3U
        #EXT-X-VERSION:3
        #EXT-X-TARGETDURATION:4
        #EXT-X-MEDIA-SEQUENCE:0
        #EXT-X-PLAYLIST-TYPE:VOD
        #EXT-X-KEY:METHOD=AES-128,URI="http://localhost:8080/playback/abc/license.key",IV=0xCAFEBABECAFEBABECAFEBABECAFEBABE
        #EXTINF:4.000,
        segment_000.ts
        #EXTINF:4.000,
        segment_001.ts
        #EXT-X-ENDLIST
        """;

    @Test
    void stitchedManifestHasAdBeforeProgramAndKeyOnlyAroundProgram() {
        AdManifestStitcher stitcher = new AdManifestStitcher(null);
        String out = stitcher.stitch(
            AD_MANIFEST,
            "http://127.0.0.1:8090/ads/preroll-brand-a/master.m3u8",
            PROGRAM_MANIFEST,
            new StitchOptions("preroll-brand-a"));

        int dateRange = out.indexOf("#EXT-X-DATERANGE:ID=\"demo-preroll\"");
        int adClearKey = out.indexOf("#EXT-X-KEY:METHOD=NONE");
        int firstAdSegment = out.indexOf("http://127.0.0.1:8090/ads/preroll-brand-a/segment_000.ts");
        int disco = out.indexOf("#EXT-X-DISCONTINUITY");
        int programKey = out.indexOf("#EXT-X-KEY:METHOD=AES-128");
        int firstProgramSegment = out.indexOf("\nsegment_000.ts", disco);

        assertThat(dateRange).isGreaterThan(-1);
        assertThat(adClearKey).isGreaterThan(dateRange);
        assertThat(firstAdSegment).isGreaterThan(adClearKey);
        assertThat(disco).isGreaterThan(firstAdSegment);
        assertThat(programKey).isGreaterThan(disco);
        assertThat(firstProgramSegment).isGreaterThan(programKey);
    }

    @Test
    void stitchedManifestContainsAdDurationOnDateRange() {
        AdManifestStitcher stitcher = new AdManifestStitcher(null);
        String out = stitcher.stitch(
            AD_MANIFEST,
            "http://127.0.0.1:8090/ads/preroll-brand-a/master.m3u8",
            PROGRAM_MANIFEST,
            new StitchOptions("preroll-brand-a"));

        assertThat(out).contains("DURATION=5.0");
        assertThat(out).contains("X-AD-ID=\"preroll-brand-a\"");
    }

    @Test
    void absoluteAdSegmentUrlsAreResolvedFromManifestBaseUrl() {
        AdManifestStitcher stitcher = new AdManifestStitcher(null);
        String out = stitcher.stitch(
            AD_MANIFEST,
            "http://127.0.0.1:8090/ads/preroll-brand-a/master.m3u8",
            PROGRAM_MANIFEST,
            new StitchOptions("preroll-brand-a"));

        assertThat(out).contains("http://127.0.0.1:8090/ads/preroll-brand-a/segment_000.ts");
        assertThat(out).contains("http://127.0.0.1:8090/ads/preroll-brand-a/segment_001.ts");
        assertThat(out).contains("http://127.0.0.1:8090/ads/preroll-brand-a/segment_002.ts");
    }
}
