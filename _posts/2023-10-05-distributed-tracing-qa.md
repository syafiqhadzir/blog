---
layout: post
title: 'Distributed Tracing for QA: Introduction to Murder Mystery'
date: 2023-10-05
category: QA
slug: distributed-tracing-qa
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
---## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Microservice Murder Mystery](#the-microservice-murder-mystery)
- [Spans, Traces, and Context](#spans-traces-and-context)
- [Code Snippet: Creating a Span](#code-snippet-creating-a-span)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

In a Monolith, if a request is slow, you look at the `slow_query_log` and blame the DBA. In Microservices, if a request is slow, you look at... nothing. You stare into the abyss.

Did the Frontend call the Backend? Did the Backend call the Auth Service? Did the Auth Service allow the Redis Cache to timeout?

**Distributed Tracing** (Jaeger, Zipkin, Honeycomb) visualises the entire lifespan of a request as a waterfall chart. It turns "I think it's slow (Opinion)" into "It's slow because the Checkout Service took 2s to talk to Stripe (Fact)."

## TL;DR

- **Trace is the full journey**: The full journey of a request.
- **Span is a single unit**: A single unit of work (e.g., "DB Query").
- **Context Propagation passes the ID**: Passing the `Trace-ID` header between services.

## The Microservice Murder Mystery

Imagine a request fails with a 500 error.

- **Service A** says: "Service B returned 500".
- **Service B** says: "Service C timed out".
- **Service C** says: "I was waiting for the Database".
- **Database** says: "I was fine, nobody called me."

Without tracing, this investigation takes 3 days and involves 4 meetings.

With tracing, you open the Trace ID in Jaeger, see a red bar on Service C, click it, and see "Connection Pool Exhausted". Time to solve: 3 minutes.

## Spans, Traces, and Context

To make tracing work, every service must agree to play "Pass the Parcel".

When Service A calls Service B, it MUST inject a header (e.g., `uber-trace-id` or `traceparent`). If Service B drops the header, the trace breaks, and you are blind again.

**QA Challenge**: Verify **Context Propagation**. Write a test that sends a request with a specific `trace-id` and asserts that the downstream logs contain that same ID.

## Code Snippet: Creating a Span

Using OpenTelemetry (the industry standard) to manually instrument a piece of code that is being suspicious.

```javascript
// order-service.js
const { trace } = require('@opentelemetry/api');

async function processOrder(orderId) {
  // Get the current active span (passed from the parent)
  const tracer = trace.getTracer('order-service');
  
  return tracer.startActiveSpan('processOrder', async (span) => {
    try {
      span.setAttribute('order.id', orderId);
      
      // Artificial delay (simulation)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log(`Processing order ${orderId}`);
      span.addEvent('Processing complete');
      
      return { status: 'processed' };
    } catch (err) {
      span.recordException(err);
      span.setStatus({ code: 'ERROR', message: err.message });
      throw err;
    } finally {
      span.end(); // Don't forget to close it!
    }
  });
}
```

## Summary

Distributed Tracing is the only way to retain your sanity in a microservice architecture. It provides the "Wow" factor.

When you show a waterfall chart to a manager and point at the big long red bar that says "Legacy System", you do not even need to speak. The chart does the blaming for you.

## Key Takeaways

- **Sampling reduces overhead**: In production, trace 1% of requests. In Staging, trace 100% (so your tests are always visible).
- **Headers need forwarding**: If you use a custom HTTP client, ensure it forwards headers. `axios` does not do it automatically.
- **Tags improve searchability**: Add meaningful tags like `user_id` or `payment_method` to your spans for better searchability.

## Next Steps

- **Visualise**: Spin up Jaeger locally using Docker Compose and point your local app to it.
- **Auto-Instrument**: Use libraries that auto-patch `http`, `pg`, and `redis` so you do not have to write manual spans.
- **Audit**: Check for "Broken Traces" where the waterfall stops abruptly. That service is the culprit.
