package com.example.adservice;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

import com.example.adservice.config.AdProperties;
import com.example.adservice.config.AdProperties.AdEntry;
import com.example.adservice.service.AdMediaGenerator;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * Real FFmpeg run. Skipped when ffmpeg isn't on PATH so this is safe for
 * CI environments that don't ship FFmpeg.
 */
class AdMediaGeneratorTest {

    @Test
    void generatesMp4AndHlsManifestWithSegments(@TempDir Path tmp) throws IOException {
        assumeTrue(ffmpegAvailable(), "ffmpeg not on PATH");

        AdProperties props = new AdProperties();
        props.setOutputDir(tmp.toString());
        props.setFfmpegPath("ffmpeg");
        props.setSegmentDurationSeconds(1);

        AdEntry ad = new AdEntry();
        ad.setId("test-ad");
        ad.setTitle("Test Ad");
        ad.setDurationSeconds(2);
        ad.setPrimaryColor("0x0b6e4f");
        ad.setAccentColor("0xffffff");
        ad.setTagline("TEST");
        ad.setAudioFrequency(660);

        AdMediaGenerator gen = new AdMediaGenerator(props);
        gen.ensureGenerated(ad);

        Path manifest = gen.masterManifest("test-ad");
        Path mp4 = gen.mp4("test-ad");
        assertThat(manifest).exists();
        assertThat(mp4).exists();
        assertThat(Files.size(mp4)).isGreaterThan(1024);

        String body = Files.readString(manifest);
        assertThat(body).contains("#EXTM3U");
        assertThat(body).contains("#EXT-X-TARGETDURATION");
        assertThat(body).contains(".ts");

        Path firstSegment = gen.segment("test-ad", "segment_000.ts");
        assertThat(firstSegment).exists();
        assertThat(Files.size(firstSegment)).isGreaterThan(0);
    }

    @Test
    void secondCallReusesCachedOutput(@TempDir Path tmp) throws IOException {
        assumeTrue(ffmpegAvailable(), "ffmpeg not on PATH");

        AdProperties props = new AdProperties();
        props.setOutputDir(tmp.toString());
        props.setFfmpegPath("ffmpeg");
        props.setSegmentDurationSeconds(1);

        AdEntry ad = new AdEntry();
        ad.setId("cached-ad");
        ad.setTitle("Cached");
        ad.setDurationSeconds(1);
        ad.setPrimaryColor("0x000000");
        ad.setAccentColor("0xffffff");
        ad.setTagline("X");
        ad.setAudioFrequency(440);

        AdMediaGenerator gen = new AdMediaGenerator(props);
        long t0 = System.nanoTime();
        gen.ensureGenerated(ad);
        long firstNs = System.nanoTime() - t0;

        long t1 = System.nanoTime();
        gen.ensureGenerated(ad);
        long secondNs = System.nanoTime() - t1;

        // Caching should be drastically faster than the first FFmpeg invocation.
        assertThat(secondNs).isLessThan(firstNs / 5);
    }

    private static boolean ffmpegAvailable() {
        try {
            Process p = new ProcessBuilder(List.of("ffmpeg", "-version")).redirectErrorStream(true).start();
            boolean done = p.waitFor(5, TimeUnit.SECONDS);
            return done && p.exitValue() == 0;
        } catch (IOException | InterruptedException e) {
            if (e instanceof InterruptedException) Thread.currentThread().interrupt();
            return false;
        }
    }
}
