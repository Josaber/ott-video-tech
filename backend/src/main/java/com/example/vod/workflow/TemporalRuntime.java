package com.example.vod.workflow;

import com.example.vod.config.TemporalProperties;
import com.example.vod.workflow.activities.PublishingActivities;
import io.temporal.client.WorkflowClient;
import io.temporal.serviceclient.WorkflowServiceStubs;
import io.temporal.serviceclient.WorkflowServiceStubsOptions;
import io.temporal.testing.TestWorkflowEnvironment;
import io.temporal.worker.Worker;
import io.temporal.worker.WorkerFactory;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Owns the embedded Temporal test environment (or a remote stub when
 * app.temporal.mode=remote) and the worker factory that hosts the
 * VideoPublishingWorkflow + PublishingActivitiesImpl.
 */
@Component
public class TemporalRuntime {

    private static final Logger log = LoggerFactory.getLogger(TemporalRuntime.class);

    private final TemporalProperties properties;
    private final PublishingActivities activities;

    private TestWorkflowEnvironment embeddedEnv;
    private WorkflowServiceStubs remoteStubs;
    private WorkerFactory factory;
    private WorkflowClient client;

    public TemporalRuntime(TemporalProperties properties, PublishingActivities activities) {
        this.properties = properties;
        this.activities = activities;
    }

    @PostConstruct
    public void start() {
        if ("remote".equalsIgnoreCase(properties.getMode())) {
            log.info("starting Temporal remote stubs target={}", properties.getRemote().getTarget());
            remoteStubs = WorkflowServiceStubs.newServiceStubs(
                WorkflowServiceStubsOptions.newBuilder()
                    .setTarget(properties.getRemote().getTarget())
                    .build());
            client = WorkflowClient.newInstance(remoteStubs);
            factory = WorkerFactory.newInstance(client);
        } else {
            log.info("starting embedded Temporal test environment");
            embeddedEnv = TestWorkflowEnvironment.newInstance();
            client = embeddedEnv.getWorkflowClient();
            factory = embeddedEnv.getWorkerFactory();
        }

        Worker worker = factory.newWorker(properties.getTaskQueue());
        worker.registerWorkflowImplementationTypes(VideoPublishingWorkflowImpl.class);
        worker.registerActivitiesImplementations(activities);
        factory.start();
        if (embeddedEnv != null) {
            embeddedEnv.start();
        }
    }

    public WorkflowClient client() {
        return client;
    }

    @PreDestroy
    public void stop() {
        if (factory != null) {
            try { factory.shutdownNow(); } catch (Exception ignored) {}
        }
        if (embeddedEnv != null) {
            try { embeddedEnv.close(); } catch (Exception ignored) {}
        }
        if (remoteStubs != null) {
            try { remoteStubs.shutdownNow(); } catch (Exception ignored) {}
        }
    }
}
