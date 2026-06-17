package com.example.vod.workflow;

import io.temporal.workflow.WorkflowInterface;
import io.temporal.workflow.WorkflowMethod;
import java.util.UUID;

@WorkflowInterface
public interface VideoPublishingWorkflow {

    @WorkflowMethod
    void publish(UUID assetId);
}
