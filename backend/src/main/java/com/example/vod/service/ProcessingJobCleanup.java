package com.example.vod.service;

import com.example.vod.domain.JobStatus;
import com.example.vod.repository.ProcessingJobRepository;
import java.time.Duration;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Background task that deletes SUCCEEDED job rows older than the configured
 * retention window. FAILED rows are kept indefinitely so post-mortems can
 * still walk the timeline.
 */
@Component
public class ProcessingJobCleanup {

    private static final Logger log = LoggerFactory.getLogger(ProcessingJobCleanup.class);

    private final ProcessingJobRepository jobs;
    private final Duration retention;

    public ProcessingJobCleanup(ProcessingJobRepository jobs,
                                @Value("${app.jobs.retention-days:30}") int retentionDays) {
        this.jobs = jobs;
        this.retention = Duration.ofDays(retentionDays);
    }

    // 03:15 local daily; offset to avoid clashing with most other 03:00 cron jobs.
    @Scheduled(cron = "${app.jobs.cleanup-cron:0 15 3 * * *}")
    public void cleanup() {
        Instant cutoff = Instant.now().minus(retention);
        int deleted = jobs.deleteByStatusAndCreatedAtBefore(JobStatus.SUCCEEDED, cutoff);
        if (deleted > 0) {
            log.info("cleaned {} succeeded jobs older than {}", deleted, cutoff);
        }
    }
}
