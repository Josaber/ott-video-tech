package com.example.vod.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.media")
public class MediaProperties {
    private String uploadDir = "./data/uploads";
    private String processedDir = "./data/processed";
    private String ffmpegPath = "ffmpeg";
    private int hlsSegmentSeconds = 4;
    private String publicBaseUrl = "http://127.0.0.1:8080";

    public String getUploadDir() { return uploadDir; }
    public void setUploadDir(String uploadDir) { this.uploadDir = uploadDir; }

    public String getProcessedDir() { return processedDir; }
    public void setProcessedDir(String processedDir) { this.processedDir = processedDir; }

    public String getFfmpegPath() { return ffmpegPath; }
    public void setFfmpegPath(String ffmpegPath) { this.ffmpegPath = ffmpegPath; }

    public int getHlsSegmentSeconds() { return hlsSegmentSeconds; }
    public void setHlsSegmentSeconds(int hlsSegmentSeconds) { this.hlsSegmentSeconds = hlsSegmentSeconds; }

    public String getPublicBaseUrl() { return publicBaseUrl; }
    public void setPublicBaseUrl(String publicBaseUrl) { this.publicBaseUrl = publicBaseUrl; }
}
