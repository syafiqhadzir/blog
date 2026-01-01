---
layout: post
title: 'API Gateway Performance Testing: The Bouncer at the Club'
date: 2023-03-09
category: QA
slug: api-gateway-performance
gpgkey: EBE8 BD81 6838 1BAF
tags:

- performance
- qa
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Middleware Tax](#the-middleware-tax)
- [Metrics That Matter (Stop Looking at Averages)](#metrics-that-matter-stop-looking-at-averages)
- [Code Snippet: Using k6 to Hammer the Gateway](#code-snippet-using-k6-to-hammer-the-gateway)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

The API Gateway (Kong, Nginx, AWS API Gateway) is the bouncer of your microservices club. It creates the first impression.

If the bouncer is slow, checking IDs one by one with a magnifying glass whilst a queue forms around the block, people are going to leave and go to the club next door (your competitor). Testing the gateway is distinct from testing the services behind it. We care about throughput (RPS) and the "tax" it charges on every request.

## TL;DR

- **Latency Overhead needs measuring**: How much time does the gateway add? (Should be < 20ms).
- **Features cost CPU**: Authentication, Rate Limiting, and Transformation are CPU vampires.
- **No Magic exists**: An API Gateway is just software. It *will* crash if you overload it.
- **Tools are available**: k6, JMeter, or Gatling.

## The Middleware Tax

When you test an API Gateway, you are not testing the business logic (the "Database Service"). You are testing the infrastructure plumbing.

Everything you add to the gateway adds latency:

1. **Authentication**: Decoding JWTs requires maths. Maths takes CPU.
2. **Rate Limiting**: "Is this IP allowed?" requires a Redis lookup. Network lag.
3. **Transformation**: Converting XML to JSON takes parsing time.

If your Checkout Service responds in 50ms, but your Gateway adds 200ms of lag, your user sees 250ms. That is unacceptable. You are paying a 400% tax.

## Metrics That Matter (Stop Looking at Averages)

Do not just look at "Average Response Time". That is a lie metrics tell to managers to make them feel safe.

Look at the **p99** (99th percentile). If p99 is 2 seconds, it means 1 in 100 users is waiting 2 seconds. In a system with 1 million users, that is 10,000 angry people tweeting about how slow your app is.

## Code Snippet: Using k6 to Hammer the Gateway

k6 is a modern load testing tool written in Go/JS. Here is a script to hammer your gateway and check if it survives a "Marketing Spike".

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // Simulate ramping up traffic
  stages: [
    { duration: '30s', target: 50 },  // Ramp to 50 users (Warmup)
    { duration: '1m', target: 50 },   // Stay at 50 users (Load)
    { duration: '30s', target: 0 },   // Scale down (Cooldown)
  ],
  thresholds: {
    http_req_duration: ['p(99)<500'], // 99% of reqs must be < 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be < 1%
  },
};

export default function () {
  const url = 'https://api.mygateway.com/public/v1/products';
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': 'Bearer ...' // HUGE difference in perf if this is on
    },
  };

  const res = http.get(url, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'latency is low': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

Running this will show you exactly when the Gateway starts to sweat. If the latency spikes when you enable Authentication, you know the bottleneck is not the network; it is the CPU.

## Summary

The API Gateway is often the single point of failure. If it goes down, everything goes down.

Performance testing it is not optional; it is survival. Configure the thread pools, tune the worker processes, and ensure the bouncer keeps the queue moving.

## Key Takeaways

- **Isolate for measurement**: Test the Gateway with a mocked backend (responding in 0ms) to measure *pure* Gateway latency.
- **Spike Test reveals limits**: Sudden traffic breaks gateways faster than steady traffic.
- **Cache drops latency**: If you cache responses, the p99 should drop to < 10ms. Verify it.

## Next Steps

- **Baseline**: Measure your current gateway latency overhead. (Total Time - Upstream Time).
- **JWT Perf**: Run a test with and without JWT validation. The difference will scare you.
- **Worker Processes**: Check if your Nginx/Kong config uses all available CPU cores.
