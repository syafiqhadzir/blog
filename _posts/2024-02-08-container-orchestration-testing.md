---
layout: post
title: 'Container Orchestration Testing: Because "It Restarted Automatically" Isn''t
  a Strategy'
date: 2024-02-08
category: QA
slug: container-orchestration-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "CrashLoopBackOff" Nightmare](#the-crashloopbackoff-nightmare)
- [Liveness vs. Readiness (Know the Difference)](#liveness-vs-readiness-know-the-difference)
- [Code Snippet: A Robust Health Check](#code-snippet-a-robust-health-check)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Kubernetes (K8s) is Greek for "Helmsman". It is also Engineering-speak for "I have 500 YAML files and I don't know which
one broke the website".

Moving to K8s adds a layer of complexity that typical functional tests miss. An app fits on a developer's laptop but
might explode when spread across 50 nodes because of network partitions or resource quotas.

Testing K8s is not about code; it is about **Resilience**.

## TL;DR

- **Readiness Probes prevent premature traffic**: Stop K8s from sending traffic to a pod that is still booting up (Java
  developers, I am looking at you).
- **Resource Limits prevent OOMKill**: If you do not limit memory, OOMKiller will come for you.
- **Secrets need encryption**: Are your DB passwords base64 encoded? That is not encryption, that is obfuscation.

## The "CrashLoopBackOff" Nightmare

We have all seen it. The pod starts, dies, starts, dies.

QA often ignores this level of the stack. "That's DevOps' problem." Wrong. If the app is misconfigured, it is a bug.

You need to test how the application behaves when it is *throttled*. Create a test that consumes 100% of the allocated
CPU. Does the pod die gracefully, or does it take the whole node down?

## Liveness vs. Readiness (Know the Difference)

- **Liveness**: "Am I dead?" (If yes, restart me).
- **Readiness**: "Am I busy?" (If yes, do not send traffic, but do not kill me).

Confusing these two is why your site goes down during traffic spikes. If a pod is overwhelmed (High Load), it fails the
Liveness probe, K8s kills it, reducing capacity, making other pods MORE overwhelmed, causing a cascade failure.

## Code Snippet: A Robust Health Check

Do not just check port 80. Check dependencies. But be careful—checking a database in a liveness probe can cause
cascading failures if the DB slows down.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: robust-app
spec:
  containers:
  - name: my-app
    image: my-app:v1
    # Check "Are you dead?"
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 15
      periodSeconds: 20
    # Check "Are you ready to serve traffic?"
    readinessProbe:
        httpGet:
            path: /ready
            port: 8080
        initialDelaySeconds: 5
        periodSeconds: 10
```

*Note: Your `/healthz` endpoint should return 200 OK if the binary is running. Your `/ready` endpoint should check if
the DB connection is active and the cache is warmed up.*

## Summary

Kubernetes is powerful, but it assumes your application is a "Good Cloud Citizen". If your app assumes local disk
storage or static IP addresses, K8s will eat it for breakfast.

Test the infrastructure contract.

## Key Takeaways

- **Helm Charts need testing**: Treat config as code. Test your Helm charts (there are unit tests for Helm!).
- **Chaos Engineering reveals failures**: Delete a random pod in Staging. Did anyone notice?
- **Observability distinguishes healing from broken**: If a pod restarts 50 times a day, that is not "Self Healing",
  that is "Broken".

## Next Steps

- **Review**: Open your `deployment.yaml`. Do you have `resources.limits` set?
- **Audit**: Check your Probes. Are you using the same endpoint for Liveness and Readiness? (Stop it).
- **Scale**: Manually scale your deployment to 0, then to 10. Watch the logs.
