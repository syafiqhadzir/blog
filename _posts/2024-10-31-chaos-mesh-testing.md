---
layout: post
title: 'Chaos Mesh Testing: Injecting Pain for Profit'
date: 2024-10-31
category: QA
slug: chaos-mesh-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Why Kubernetes Needs Chaos](#why-kubernetes-needs-chaos)
- [The "Pod Kill" Experiment](#the-pod-kill-experiment)
- [Code Snippet: Chaos Mesh YAML](#code-snippet-chaos-mesh-yaml)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

"The network is reliable."
"Latency is zero."
"Bandwidth is infinite."
"The junior dev won't delete the prod database."

These are the [Fallacies of Distributed Computing](https://en.wikipedia.org/wiki/Fallacies_of_distributed_computing). Chaos Engineering is the practice of breaking these assumptions intentionally to see if your app cries or adapts.

Chaos Mesh is the Kubernetes-native way to do it.

## TL;DR

- **Start Small**: Do not kill the database on day 1. Kill a stateless frontend pod. Build confidence.
- **Observability is mandatory**: If you cannot see the chaos (Metrics/Logs), do not run the chaos. You need to know *when* and *why* it broke.
- **Hypothesis drives experiments**: "If I kill one Redis node, latency will spike by 10% but errors will remain 0." Validate it.

## Why Kubernetes Needs Chaos

Kubernetes is complex. Pods move. Nodes die. DNS flickers. IP tables get saturated.

If your app crashes because a single pod restarted, you are not "Cloud Native", you are "Cloud Naive".

**Chaos Mesh lets you simulate**:

- **Pod Kill**: Forceful termination (SIGKILL).
- **Network Partition**: Split brain (make the DB unreachable).
- **IO Stress**: Fill the disk with rubbish.
- **Clock Skew**: Mess with NTP (Time travel).

## The "Pod Kill" Experiment

This is the "Hello World" of Chaos. Randomly delete pods in a namespace.

Your ReplicaSet should re-create them. Your LoadBalancer should stop sending traffic to the dead ones.

If your users see a 502 Bad Gateway... you failed. You likely have long running requests that did not handle the shutdown signal gracefully.

## Code Snippet: Chaos Mesh YAML

Apply this monitoring-as-code to schedule random pod destruction.

```yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: random-pod-kill
  namespace: chaos-testing
spec:
  action: pod-kill
  mode: one # Kill one pod at a time. Change to 'all' if you want to be sacked.
  selector:
    namespaces:
      - production # (Wait, maybe change this to staging first?)
    labelSelectors:
      app: my-microservice
  duration: "30s"
  scheduler:
    cron: "@every 10m" # Keep killing it every 10 minutes
```

## Summary

Chaos Engineering sounds scary. But you know what is scarier? Unplanned chaos at 3 AM on Christmas.

Inject controlled chaos now, so you can sleep later. If you are not breaking your system, your users are.

## Key Takeaways

- **Blast Radius must be limited**: Limit chaos to specific namespaces or labels. Do not blow up the cluster control plane (`kube-system`).
- **Automatic rollback is available**: Chaos Mesh can abort the experiment if health checks fail (e.g., if Error Rate > 5%).
- **GameDay creates team training**: Make it a team event. "Friday Afternoon Chaos". Order pizza. Watch the dashboards burn.

## Next Steps

- **Tool**: Install **Chaos Mesh** or **LitmusChaos** on your staging cluster.
- **Learn**: Read the [Principles of Chaos Engineering](https://principlesofchaos.org/).
- **Audit**: Does your frontend implement "Retry with Exponential Backoff"? Chaos will verify it. If it retries immediately, you will DDoS yourself.
