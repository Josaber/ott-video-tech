package com.example.vod.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.playback")
public class PlaybackProperties {

    /** Max concurrent streams per user. Default mirrors the typical OTT plan. */
    private int concurrentStreamLimit = 2;

    /** Seconds since last heartbeat after which a session is considered stale. */
    private int heartbeatStaleSeconds = 90;

    public int getConcurrentStreamLimit() { return concurrentStreamLimit; }
    public void setConcurrentStreamLimit(int v) { this.concurrentStreamLimit = v; }

    public int getHeartbeatStaleSeconds() { return heartbeatStaleSeconds; }
    public void setHeartbeatStaleSeconds(int v) { this.heartbeatStaleSeconds = v; }
}
