package com.example.vod.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.ssai")
public class SsaiProperties {
    private String adServiceBaseUrl = "http://127.0.0.1:8090";
    /** Legacy: single-ad preroll. Used when prerollPod is empty. */
    private String adId = "preroll-brand-a";
    /** Ordered list of ad ids forming the preroll ad pod. */
    private List<String> prerollPod = List.of();
    /**
     * Total preroll-pod duration in seconds — used to map stitched-timeline
     * positions back to program time for the continue-watching sprite cell.
     * Default 16 s matches the demo's brand-a (5 s) + brand-b (8 s) + brand-c (3 s) pod.
     */
    private int prerollPodDurationSeconds = 16;
    /** Single ad id inserted as a mid-roll at midrollPositionFraction. Empty = no mid-roll. */
    private String midrollAdId = "";
    /** Fraction (0..1) through the program where the mid-roll lands. */
    private double midrollPositionFraction = 0.5;

    public String getAdServiceBaseUrl() { return adServiceBaseUrl; }
    public void setAdServiceBaseUrl(String adServiceBaseUrl) { this.adServiceBaseUrl = adServiceBaseUrl; }

    public String getAdId() { return adId; }
    public void setAdId(String adId) { this.adId = adId; }

    public List<String> getPrerollPod() { return prerollPod; }
    public void setPrerollPod(List<String> prerollPod) { this.prerollPod = prerollPod; }

    public int getPrerollPodDurationSeconds() { return prerollPodDurationSeconds; }
    public void setPrerollPodDurationSeconds(int prerollPodDurationSeconds) { this.prerollPodDurationSeconds = prerollPodDurationSeconds; }

    public String getMidrollAdId() { return midrollAdId; }
    public void setMidrollAdId(String midrollAdId) { this.midrollAdId = midrollAdId; }

    public double getMidrollPositionFraction() { return midrollPositionFraction; }
    public void setMidrollPositionFraction(double midrollPositionFraction) { this.midrollPositionFraction = midrollPositionFraction; }
}
