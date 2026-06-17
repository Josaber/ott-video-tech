package com.example.vod.workflow;

import com.example.vod.workflow.activities.PublishingActivities;
import io.temporal.activity.ActivityOptions;
import io.temporal.common.RetryOptions;
import io.temporal.workflow.Workflow;
import java.time.Duration;
import java.util.UUID;

public class VideoPublishingWorkflowImpl implements VideoPublishingWorkflow {

    private final PublishingActivities activities = Workflow.newActivityStub(
        PublishingActivities.class,
        ActivityOptions.newBuilder()
            .setStartToCloseTimeout(Duration.ofMinutes(20))
            .setRetryOptions(RetryOptions.newBuilder()
                .setMaximumAttempts(2)
                .setInitialInterval(Duration.ofSeconds(1))
                .build())
            .build()
    );

    @Override
    public void publish(UUID assetId) {
        activities.transcode(assetId);
        activities.packageHls(assetId);
        activities.ssai(assetId);
        activities.drm(assetId);
        activities.publish(assetId);
    }
}
