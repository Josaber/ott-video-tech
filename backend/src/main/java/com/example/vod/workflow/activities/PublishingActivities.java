package com.example.vod.workflow.activities;

import io.temporal.activity.ActivityInterface;
import io.temporal.activity.ActivityMethod;
import java.util.UUID;

@ActivityInterface
public interface PublishingActivities {

    @ActivityMethod
    void transcode(UUID assetId);

    @ActivityMethod
    void packageHls(UUID assetId);

    @ActivityMethod
    void ssai(UUID assetId);

    @ActivityMethod
    void drm(UUID assetId);

    @ActivityMethod
    void publish(UUID assetId);
}
