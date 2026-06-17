package com.example.vod.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.temporal")
public class TemporalProperties {

    private String mode = "embedded";
    private String taskQueue = "vod-publishing";
    private Remote remote = new Remote();

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public String getTaskQueue() { return taskQueue; }
    public void setTaskQueue(String taskQueue) { this.taskQueue = taskQueue; }

    public Remote getRemote() { return remote; }
    public void setRemote(Remote remote) { this.remote = remote; }

    public static class Remote {
        private String target = "127.0.0.1:7233";
        private String namespace = "default";

        public String getTarget() { return target; }
        public void setTarget(String target) { this.target = target; }
        public String getNamespace() { return namespace; }
        public void setNamespace(String namespace) { this.namespace = namespace; }
    }
}
