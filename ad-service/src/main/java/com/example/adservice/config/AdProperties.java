package com.example.adservice.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.ad")
public class AdProperties {

    private String outputDir = "./data/ads";
    private String publicBaseUrl = "http://127.0.0.1:8090";
    private String ffmpegPath = "ffmpeg";
    private int segmentDurationSeconds = 2;
    private List<AdEntry> catalog = List.of();

    public String getOutputDir() { return outputDir; }
    public void setOutputDir(String outputDir) { this.outputDir = outputDir; }

    public String getPublicBaseUrl() { return publicBaseUrl; }
    public void setPublicBaseUrl(String publicBaseUrl) { this.publicBaseUrl = publicBaseUrl; }

    public String getFfmpegPath() { return ffmpegPath; }
    public void setFfmpegPath(String ffmpegPath) { this.ffmpegPath = ffmpegPath; }

    public int getSegmentDurationSeconds() { return segmentDurationSeconds; }
    public void setSegmentDurationSeconds(int segmentDurationSeconds) {
        this.segmentDurationSeconds = segmentDurationSeconds;
    }

    public List<AdEntry> getCatalog() { return catalog; }
    public void setCatalog(List<AdEntry> catalog) { this.catalog = catalog; }

    public static class AdEntry {
        private String id;
        private String title;
        private int durationSeconds = 5;
        private String primaryColor = "0x0b6e4f";
        private String accentColor = "0xffffff";
        private String tagline = "DEMO AD";
        private int audioFrequency = 660;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public int getDurationSeconds() { return durationSeconds; }
        public void setDurationSeconds(int durationSeconds) { this.durationSeconds = durationSeconds; }
        public String getPrimaryColor() { return primaryColor; }
        public void setPrimaryColor(String primaryColor) { this.primaryColor = primaryColor; }
        public String getAccentColor() { return accentColor; }
        public void setAccentColor(String accentColor) { this.accentColor = accentColor; }
        public String getTagline() { return tagline; }
        public void setTagline(String tagline) { this.tagline = tagline; }
        public int getAudioFrequency() { return audioFrequency; }
        public void setAudioFrequency(int audioFrequency) { this.audioFrequency = audioFrequency; }
    }
}
