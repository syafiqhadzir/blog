---
layout: post
title: 'Observability-Driven Development: Coding for 3 AM'
date: 2023-09-21
category: QA
slug: observability-driven-development
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
---## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Logs vs. Metrics vs. Traces](#logs-vs-metrics-vs-traces)
- [The Correlation ID](#the-correlation-id)
- [Code Snippet: Structured Logging](#code-snippet-structured-logging)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

If a tree falls in the forest and no one logs it, did it make a sound?

More importantly, if your API returns a 500 error and no one logs the stack trace, do you get sacked?

**Observability-Driven Development (ODD)** is the idea that "debuggability" is a feature, not an afterthought. It shifts QA from "Does it work?" to "Can I explain *why* it works (or fails)?"

## TL;DR

- **Logs are events**: "The payload was empty."
- **Metrics are aggregates**: "Error rate is 5%."
- **Traces are flows**: "It spent 2s in the database."
- **Golden Rule**: Every request needs a unique `Correlation-ID`.

## Logs vs. Metrics vs. Traces

These are the "Three Pillars" of Observability, and most people confuse them.

- **Metrics** are for **Alerting**. "CPU is high!" (Wake up).
- **Logs** are for **Debugging**. "Why is CPU high? Oh, weird loop." (Fix it).
- **Traces** are for **Optimisation**. "Which microservice is slow?" (Blame someone).

**QA Challenge**: Do not just test the feature. Test the *signals*. If I send a bad payload, does the app log `ERROR: Invalid payload` or does it log `undefined is not a function`? The first is helpful to the user; the second is a crime against humanity.

## The Correlation ID

This is the single most important concept in modern distributed systems.

When a user clicks "Buy", that request hits the Load Balancer -> Frontend -> API -> Payment Service -> Database. If the Payment Service fails, how do you find the matching log in the Frontend?

You tag the request with a unique ID at the start, and pass it down the chain like a baton.

## Code Snippet: Structured Logging

Stop using `console.log("User logged in")`. It is useless to a machine.

Use structured JSON logging so your tools (Splunk, Datadog, ELK) can index it.

```javascript
/* logger.js */
const pino = require('pino');
const logger = pino();

/* middleware.js */
const uuid = require('uuid');

function requestLogger(req, res, next) {
    // Generate or inherit Correlation ID
    const correlationId = req.headers['x-correlation-id'] || uuid.v4();
    
    // Attach to context
    req.log = logger.child({ 
        correlationId,
        path: req.path,
        method: req.method 
    });

    // Attach to response header so the client can reference it
    res.setHeader('X-Correlation-ID', correlationId);

    // LOG: "Request started"
    req.log.info('Incoming request');

    res.on('finish', () => {
        // LOG: "Request finished" with Status Code
        const logData = { statusCode: res.statusCode };
        
        if (res.statusCode >= 500) {
            req.log.error(logData, 'Request failed');
        } else {
            req.log.info(logData, 'Request completed');
        }
    });

    next();
}
```

## Summary

Observability is the difference between "guessing" and "knowing".

As QAs, we often find bugs that are "hard to reproduce". If the system had better observability, they would not be hard to reproduce; they would be right there in the logs, waving at you. Push your developers to log *context*, not just strings.

## Key Takeaways

- **JSON Logs are machine-readable**: Strings are for humans. JSON is for machines. Humans do not read logs; machines read logs and tell humans what to look at.
- **Context is mandatory**: A log without a User ID or Transaction ID is just noise.
- **Alerts need testing**: Test your alerts. Simulate a failure and time how long it takes for PagerDuty to ring (or until a customer complains on Twitter).

## Next Steps

- **Standardise**: Ensure every microservice uses the same field names (e.g., `user_id` vs `userId`).
- **Trace**: Implement OpenTelemetry to visualise the full request path.
- **Sample**: You do not need to trace 100% of requests (too expensive). Sample 5% to save money, but force-sample errors.
