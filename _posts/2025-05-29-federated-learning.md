---
layout: post
title: 'Federated Learning: Training Without Peeking'
date: 2025-05-29
category: QA
slug: federated-learning
gpgkey: EBE8 BD81 6838 1BAF
tags: ['artificial-intelligence', 'qa-strategy']
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Challenge: The Data Never Leaves](#the-challenge-the-data-never-leaves)
- [Performance \& Stability](#performance--stability)
- [Code Snippet: Federated Aggregation Simulation](#code-snippet-federated-aggregation-simulation)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

In traditional AI, you collect all the user data into a massive central server
(Data Lake) and train a model.

In **Federated Learning (FL)**, you send the _model_ to the user, train it on
their device using their private data, and send back only the _updates_
(gradients/weights). The raw data never leaves the phone.

Great for privacy. A nightmare for debugging. How do you reproduce a bug when
you are legally forbidden from seeing the data that caused it?

## TL;DR

- **Privacy First**: No raw data upload. Only mathematical deltas.
- **Heterogeneity is the norm**: Some users have iPhone 15s, others have £50
  Androids. The model must work on both.
- **Communication Efficiency matters**: Sending big models over 4G/5G is
  expensive.

## The Challenge: The Data Never Leaves

Since you cannot inspect the training data, you rely on **Metrics Telemetry**.
You need to know:

1. **Loss Curves**: Is the model actually learning on the device?
2. **Data Skew**: Does this user mostly see "Daytime" photos whilst another sees
   "Nighttime"? (Non-IID data).
3. **Model Poisoning**: Did a malicious actor modify the weights to sabotage the
   global model?

## Performance & Stability

Training a Neural Network is heavy.

**QA Rule #1**: ONLY train when the device is:

1. **Idle** (Screen off).
2. **Charging** (Power connected).
3. **On Wi-Fi** (Unmetered network).

If you violate this, users will uninstall your app because it drained their
battery in 2 hours. They will leave a one- star review. Your career will suffer.

## Code Snippet: Federated Aggregation Simulation

Simulating the server-side aggregation of updates (FedAvg) with basic outlier
detection (to prevent poisoning).

```javascript
/*
  server/aggregator.test.js
  Simulating Federated Averaging with Outlier Rejection
*/

class FederatedServer {
  constructor() {
    this.globalWeights = 0.5; // Simplified single weight
    this.updates = [];
  }

  receiveUpdate(clientId, weightDelta) {
    this.updates.push({ clientId, weightDelta });
  }

  aggregate() {
    if (this.updates.length === 0) return;

    // 1. Filter Outliers (Basic Defence against Poisoning)
    // If a delta is > 10x the median, reject it.
    const deltas = this.updates.map((u) => u.weightDelta).sort((a, b) => a - b);
    const median = deltas[Math.floor(deltas.length / 2)];

    const validUpdates = this.updates.filter((u) => {
      return Math.abs(u.weightDelta - median) < 0.5; // Strict threshold for demo
    });

    // 2. Average the valid updates (FedAvg)
    const sum = validUpdates.reduce((acc, u) => acc + u.weightDelta, 0);
    const average = sum / validUpdates.length;

    // 3. Update Global Model
    this.globalWeights += average;
    this.updates = []; // Reset for next round

    return { average, dropped: this.updates.length - validUpdates.length };
  }
}

test('should reject malicious outliers during aggregation', () => {
  const server = new FederatedServer();

  // Honest clients
  server.receiveUpdate('client-A', 0.01);
  server.receiveUpdate('client-B', 0.02);
  server.receiveUpdate('client-C', -0.01);

  // Malicious client (Poisoning Attack)
  server.receiveUpdate('BAD-ACTOR', 10.0);

  const result = server.aggregate();

  expect(server.globalWeights).toBeCloseTo(0.5 + (0.01 + 0.02 - 0.01) / 3);
  // The 10.0 update should be ignored
  expect(result.average).toBeLessThan(1.0);
});
```

## Summary

Federated Learning allows us to build smarter apps without building a
surveillance state. It respects the user.

But it requires a comprehensive testing harness that can simulate thousands of
diverse, flaky, disconnected devices contributing to a shared brain.

## Key Takeaways

- **Constraint Testing is essential**: Test strictly for battery, thermal, and
  network usage constraints.
- **Stragglers must be handled**: What happens if 50% of devices drop out
  mid-training? (The server must move on).
- **Secure Aggregation adds privacy**: Use cryptography so the server cannot
  even see individual updates, only the sum.

## Next Steps

- **Tool**: Explore **TensorFlow Federated (TFF)** or **PySyft** (OpenMined).
- **Concept**: Learn about **Differential Privacy** (adding noise to hide
  individuals).
- **Read**: Google's paper on "Federated Learning: Collaborative Machine
  Learning without Centralised Training Data".
