---
layout: post
title: 'Performance Testing: Why Your App Collapses on Black Friday'
date: 2022-12-01
category: QA
slug: performance-testing
gpgkey: 4AEE 18F8 3AFD EB23
tags:
- performance
- quality-assurance
- testing
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Smoke Testing](#smoke-testing)
- [Load Testing](#load-testing)
- [Stress Testing](#stress-testing)
- [Soak Testing](#soak-testing)
- [Code Snippet: The K6 Load Test](#code-snippet-the-k6-load-test)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Performance testing is the gym workout of software engineering. Everyone wants to be fit (fast), but nobody wants to do
the heavy lifting (scripting) until the week before summer (Black Friday).

It determines stability, availability, scalability, reliability, and responsiveness. Essentially, does your app collapse
like a frantic waiter when 50 tables order at once?

## TL;DR

- **Smoke Test**: Does it turn on without creating a fire hazard?
- **Load Test**: Can it handle the expected traffic without crying?
- **Stress Test**: What happens if we double the traffic? Does it crash gracefully or leave a crater?
- **Soak Test**: Can it run for 24 hours without leaking memory like a sieve?
- **Tools are essential**: Manual testing is useless here. Use K6, JMeter, or Gatling.

## Smoke Testing

The term originated in hardware repair. You plug in the device; if smoke comes out, you unplug it and go to the pub.

In software, if the login page throws a 500 error immediately, there is no point in running a 5-hour regression suite.
It is the "Hello World" of performance confidence.

## Load Testing

Load tests simulate real-life application load. The goal is to compare actual metrics against expected benchmarks
(SLAs). If your website is a lift, load testing checks if it can carry the 10 people it says it can on the placard.

We look for:

- **Response Time**: Should be under 200ms.
- **Throughput**: Requests per Second (RPS).
- **Concurrency**: How many users can be active before the database locks up?

## Stress Testing

Stress Testing is asking, "What is the breaking point?"

We deliberately overload the system to see *how* it fails. Does it show a nice "We are busy" page, or does it leak
database connections and display a stack trace containing your AWS keys? It is arguably more important to know how you
fail than how you succeed.

## Soak Testing

Soak Testing (or Endurance Testing) assesses performance over an extended period. A system might run beautifully for an
hour but crash after 24 hours because a developer forgot to close a file handle.

Think of it like a marathon. You might sprint the first mile, but if you pass out at mile 20, you have not finished the
race.

## Code Snippet: The K6 Load Test

Here is a modern load test script using **K6**. It is JavaScript, so you have no excuse not to read it.

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuration: The "Gym Plan"
export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Warm up to 20 users
    { duration: '1m', target: 20 },  // Stay there (Load Test)
    { duration: '10s', target: 50 }, // Spike to 50 users (Stress Test)
    { duration: '20s', target: 0 },  // Cool down
  ],
};

export default function () {
  const res = http.get('https://test-api.k6.io/public/crocodiles/');
  
  // Did it work?
  check(res, {
    'is status 200': (r) => r.status === 200,
    'is fast (<500ms)': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

## Summary

Performance testing is all about reputation. Users are fickle; if your site takes 3 seconds to load, they are already on
your competitor's site.

It is not just about software quality, but about respecting the user's finite time on this earth.

## Key Takeaways

- **Start Early**: Do not leave performance testing for the week before launch.
- **Fail Gracefully**: Ensure your system handles stress without data corruption.
- **Leaking Memory is found by Soak tests**: Soak tests find bugs that unit tests never will.

## Next Steps

- **Install K6**: Go download it. It is a single binary.
- **Run a Smoke Test**: Script a simple hit to your homepage.
- **Check Logs**: During the test, watch your server logs for errors.
