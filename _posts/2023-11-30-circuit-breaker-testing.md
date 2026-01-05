---
layout: post
title: 'Circuit Breaker Testing: How to Fail Gracefully'
date: 2023-11-30
category: QA
slug: circuit-breaker-testing
gpgkey: EBE8 BD81 6838 1BAF
tags: ['artificial-intelligence', 'reliability', 'frontend-testing']
description:
  'In your house, if you use your hairdryer and toaster at the same time, the
  lights go out. A fuse blows.'
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Domino Effect of Microservices](#the-domino-effect-of-microservices)
- [Testing the "Open" State (The Fire Drill)](#testing-the-open-state-the-fire-drill)
- [Code Snippet: Tripping the Switch](#code-snippet-tripping-the-switch)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

In your house, if you use your hairdryer and toaster at the same time, the
lights go out. A fuse blows.

This is annoying, but it prevents your house from burning down.

In software, we often let the house burn down. One slow microservice can cause a
pile-up of requests, consuming all database connections, and crashing the entire
platform. **Circuit Breakers** (like Resilience4j or Hystrix) are designed to
stop this. But do they actually work?

## TL;DR

- **Closed is normal**: Requests go through.
- **Open is broken**: Requests fail fast (no wait time).
- **Half-Open is tentative**: "Are you still angry, Service B?" (One request is
  let through; if it works, we close the circuit).

## The Domino Effect of Microservices

Imagine Service A calls Service B. Service B is running slow (latency = 30
seconds).

Service A keeps calling, waiting 30 seconds for each thread. Eventually, Service
A runs out of threads and dies.

Service C, which calls Service A, now dies.

Congratulations, you have achieved **Cascading Failure**.

A Circuit Breaker detects that Service B is sick, opens the circuit, and
immediately returns "Sorry, try again later" to Service A, saving its resources.

## Testing the "Open" State (The Fire Drill)

You cannot test a fire alarm without a fire (or a drill). To test a circuit
breaker, you must effectively murder the dependency.

1. **Latency Attack**: Use Toxiproxy to add 10 seconds of delay to the DB
   connection.
2. **Error Injection**: Configure the dependency to return 500 errors
   continuously.
3. **Verification**: Ensure the App returns a predefined Fallback (e.g., cached
   data) instead of hanging.

## Code Snippet: Tripping the Switch

Here is a conceptual test using a mock HTTP client with a built-in breaker (like
`gobreaker` or `opossum`).

```javascript
/* 
  Simulate a Circuit Breaker Test
*/
const CircuitBreaker = require('opossum');

// The function that might fail
function unreliableApiCall() {
  return new Promise((resolve, reject) => {
    // Simulate a failure 60% of the time via randomness
    if (Math.random() < 0.6) {
      reject('Service Unavailable');
    } else {
      resolve('Success Data');
    }
  });
}

// Wrap it in a Breaker
const breaker = new CircuitBreaker(unreliableApiCall, {
  errorThresholdPercentage: 50, // Trip if > 50% fail
  resetTimeout: 3000, // Wait 3s before retry
});

// The Test Script
async function runTest() {
  console.log('🔥 Starting Load Test...');

  for (let i = 0; i < 20; i++) {
    try {
      await breaker.fire();
      console.log(`Req ${i}: ✅ Success`);
    } catch (e) {
      if (breaker.opened) {
        console.log(`Req ${i}: ⚡ CIRCUIT OPEN (Fast Fail)`);
      } else {
        console.log(`Req ${i}: ❌ Failed (Normal Error)`);
      }
    }
  }
}

runTest();
```

## Summary

A circuit breaker that never opens is just expensive middleware. A circuit
breaker that opens too early is a denial of service.

Testing the thresholds is critical. You want the system to be resilient, not
temperamental.

## Key Takeaways

- **Fail Fast saves resources**: The user prefers an instant error over a
  60-second loading spinner.
- **Fallback Gracefully hides failures**: If the Recommendations API is down,
  show "Popular Products" (cached) instead of an empty white box.
- **Self-Healing needs verification**: Verify the `Half-Open` state. The system
  should recover automatically when the dependency recovers.

## Next Steps

- **Tooling**: Look at [Toxiproxy](https://github.com/Shopify/toxiproxy) for
  network simulation.
- **Configuration**: Review your `timeout` values. If your timeout is longer
  than the user's patience (3s), decrease it.
- **Game Day**: Schedule a chaos engineering session where you intentionally
  shut down the Redis cache.
