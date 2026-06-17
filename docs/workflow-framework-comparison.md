# Workflow Framework Comparison

This document compares workflow management options for the OTT Video Tech Demo. The demo workflow is:

```text
metadata -> raw upload -> transcode -> package -> ssai -> drm -> publish -> m3u8 playback
```

The useful workflow engine for this scenario should support long-running processing, retryable workers, visible state transitions, operational troubleshooting and a clean local demo path.

## Summary

| Framework | Style | Best Fit | Strengths | Tradeoffs | Fit For This Demo |
| --- | --- | --- | --- | --- | --- |
| Temporal | Code-first durable workflow | Long-running service workflows and worker orchestration | Strong retries, timeouts, durable execution, worker model, Java SDK | Not BPMN-native, UI requires separate server in remote mode | Excellent |
| Flowable | BPMN engine | BPMN-based business/process workflows | Familiar BPMN, embeddable engine, Spring integration | More process-engine oriented than media-platform oriented | Good |
| Camunda 8 / Zeebe | BPMN + external workers | Distributed BPMN orchestration | Strong BPMN modeling, external worker pattern, cloud-native architecture | Heavier local setup, more moving parts | Good, but heavier |
| Netflix Conductor / Orkes Conductor | JSON/DSL workflow orchestration | Microservice task orchestration | Clear task graph, worker services, UI, common in media-style pipelines | Requires separate server stack, less natural inside a single Spring Boot demo | Good |
| Spring Statemachine | In-process state machine | Local state transitions | Lightweight, pure Spring, simple state modeling | Not a durable workflow engine, limited orchestration features | Partial |
| Spring Batch | Batch processing framework | Offline batch jobs and bulk processing | Mature chunk/step model, restartability for batch jobs | Not ideal for user-triggered interactive VOD publishing | Partial |
| Activiti | BPMN engine | Legacy BPMN workflows | Familiar BPMN concepts, embeddable | Older dependency ecosystem, less smooth with Spring Boot 4 / JDK 25 | Weak |

## Evaluation Criteria

| Criterion | Why It Matters For VOD |
| --- | --- |
| Worker isolation | Each media step should be independently testable and replaceable. |
| Retry and timeout support | Transcoding, packaging and DRM calls can fail or exceed expected time. |
| Durable workflow state | Long-running processing should survive service restarts in production. |
| Operational visibility | Operators need to understand which step failed and why. |
| Spring Boot compatibility | The backend is Spring Boot 4.1 on JDK 25. |
| Local demo cost | The sharing demo should run without heavy infrastructure. |
| Production path | The same model should scale toward real services later. |

## Framework Notes

### Temporal

Temporal is a code-first durable workflow platform. Workflows are written in Java code, and each processing step can be implemented as a retryable activity backed by a Spring-managed worker.

For this demo, Temporal maps cleanly to the VOD pipeline:

```text
VideoPublishingWorkflow
  -> transcode activity -> TranscodeWorker
  -> package activity   -> PackagingWorker
  -> ssai activity      -> SsaiWorker
  -> drm activity       -> DrmWorker
  -> publish activity   -> PublishWorker
```

Temporal is the best fit when the topic is reliable backend orchestration rather than visual BPMN modeling. It gives a realistic production story for long-running media processing while keeping code easy to explain.

The project uses embedded Temporal for the local demo and keeps remote Temporal support configurable through `app.temporal.mode=remote`.

### Flowable

Flowable is a BPMN process engine and is a practical successor-style option for teams that want diagram-driven workflows. It is a good choice when the sharing topic emphasizes BPMN notation, process modeling and workflow diagrams.

Flowable is less natural than Temporal for code-first media workers, but it is still a solid option if the product needs BPMN process definitions and business-facing workflow visibility.

### Camunda 8 / Zeebe

Camunda 8 uses BPMN with external workers. This external worker model fits VOD processing well because each media step can run independently.

The tradeoff is demo weight. A realistic Camunda 8 setup usually includes Zeebe and related platform components. It is strong for production BPMN orchestration, but heavier than this demo needs.

### Netflix Conductor / Orkes Conductor

Conductor models workflows as task graphs, often defined in JSON or a DSL, with workers executing each task. It is a good conceptual match for media pipelines and distributed microservices.

It becomes attractive when the platform needs a central orchestration service with UI, queue-backed workers and multi-service task ownership. For this small Spring Boot + React demo, it adds more infrastructure than needed.

### Spring Statemachine

Spring Statemachine can model asset state changes such as:

```text
UNPUBLISHED -> PROCESSING -> PUBLISHED
```

It is lightweight and useful for validating allowed state transitions. It does not replace a workflow engine for retryable, durable, multi-step orchestration. It is better as a companion to a workflow engine than as the main engine for VOD processing.

### Spring Batch

Spring Batch is strong for offline or scheduled batch jobs, such as processing a large catalog of videos overnight. It supports steps, restartability and chunk-oriented processing.

The demo workflow is user-triggered and interactive, so Spring Batch is not the best primary abstraction. It would fit a separate bulk ingest or backfill pipeline.

### Activiti

Activiti is a BPMN engine with familiar process concepts, but its dependency ecosystem is older. In this project environment, available Activiti versions pulled old Spring and Jackson dependencies that did not work cleanly with the Maven repository and the current Spring Boot 4 / JDK 25 stack.

For a modern demo, Flowable is usually a better BPMN-oriented choice, while Temporal is a better worker-oriented choice.

## Recommendation

Use Temporal for this demo.

Reasons:

- The VOD workflow is naturally a chain of retryable backend activities.
- Each processing step is already implemented as a dedicated worker.
- Java SDK support is current and works with the Spring Boot 4 / JDK 25 stack used here.
- Embedded Temporal keeps local setup simple while preserving a production path to a real Temporal cluster.
- The code demonstrates production-style orchestration without requiring BPMN infrastructure during the sharing session.

Use Flowable or Camunda 8 instead if the main objective is to teach BPMN modeling. Use Conductor if the main objective is platform-level microservice task orchestration with a central workflow service.