---
layout: post
title: 'Canary Release Quality Gates: Testing on Humans (Ethically)'
date: 2023-09-14
category: QA
slug: canary-release-quality-gates
gpgkey: EBE8 BD81 6838 1BAF
tags: ['devops', 'ethics']
description:
  '"I don''t always test my code, but when I do, I do it in Production." This
  meme is funny because it is true.'
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The 1% Rule](#the-1-rule)
- [Quality Gates: The Blast Radius](#quality-gates-the-blast-radius)
- [Code Snippet: The Prometheus Gate](#code-snippet-the-prometheus-gate)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

"I don't always test my code, but when I do, I do it in Production." This meme
is funny because it is true.

No matter how many staging environments you have, nothing behaves exactly like
real users on real unsteady Wi-Fi.

**Canary Deployment** is the practice of rolling out a new version to a small
subset of users (usually 1-5%) and waiting to see if they scream. If they do
not, you roll out to the rest.

## TL;DR

- **Canary is a partial rollout**: A partial rollout (e.g., 5% of traffic) to
  detect issues early.
- **Quality Gate halts failures automatically**: A rule that automatically halts
  the rollout if errors spike.
- **Metrics need monitoring**: Watch Error Rate, Latency, and Business KPIs
  (e.g., "Add to Cart" conversion).

## The 1% Rule

Why 1%? Because if you break 1% of your users, your Support team can probably
handle the ticket volume. If you break 100%, your CTO is writing an apology
letter on LinkedIn.

QA's job changes here. We are not manually clicking things anymore. We are
monitoring **Baseline vs. Canary**.

- **Baseline**: The stable version (99% of traffic).
- **Canary**: The wild new version (1% of traffic).

If the Canary has a 2% higher error rate than Baseline, KILL IT.

## Quality Gates: The Blast Radius

A "Quality Gate" is an automated bouncer. It stands at the door of the rollout
and checks IDs.

If the Canary violates a threshold (e.g., "Latency > 500ms"), the gate closes,
and the system automatically rolls back.

This removes the "human hesitation". You do not want a manager debating whether
"a few errors are okay" at 3 AM. The maths decides.

## Code Snippet: The Prometheus Gate

Here is a Prometheus Query Language (PromQL) snippet that you might use in
Grafana or a tool like Argo Rollouts to determine if the Canary is healthy.

```yaml
# prometheus-quality-gate.yaml
# Trigger a failure if Canary error rate is > 1% higher than Baseline

expression: |
  (
    sum(rate(http_requests_total{version="canary", status=~"5.*"}[5m])) 
    / 
    sum(rate(http_requests_total{version="canary"}[5m]))
  ) 
  > 
  (
    sum(rate(http_requests_total{version="baseline", status=~"5.*"}[5m])) 
    / 
    sum(rate(http_requests_total{version="baseline"}[5m]))
  ) + 0.01

message:
  '🚨 Canary Error Rate is significantly higher than Baseline! Rolling back.'
```

If this expression evaluates to `true`, the deployment pipeline aborts
immediately.

## Summary

Canary releases turn deployment from a "Cliff Edge" into a "Gentle Ramp".

They allow you to be bold with features but conservative with risk. As a QA,
your focus shifts from "finding bugs" to "defining the criteria for a healthy
system".

## Key Takeaways

- **Automate Rollback**: Do not rely on a button press. If metrics fail, the
  system should heal itself.
- **Sticky Sessions prevent confusion**: Ensure the same user stays on the
  Canary. Do not swap them back and forth, or they will get confused (and lose
  their shopping cart).
- **Log Context by version**: Add `{ version: "canary" }` to your JSON logs so
  you can filter errors by version.

## Next Steps

- **Define SLIs**: Service Level Indicators. What _exactly_ constitutes a
  failure? (500s? Latency?)
- **Segment**: Can you release only to internal employees first?
- **Wait**: Allow enough time (e.g., 30 mins) for statistical significance
  before expanding to 10%.
