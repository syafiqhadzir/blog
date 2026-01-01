---
layout: post
title: 'Advanced Trace Analysis: Reading the Tea Leaves'
date: 2025-07-17
category: QA
slug: advanced-trace-analysis
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Needle in the Haystack](#the-needle-in-the-haystack)
- [Structural Anomalies](#structural-anomalies)
- [Code Snippet: Analysing Traces for N+1 Problems](#code-snippet-analysing-traces-for-n1-problems)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

You have Jaeger or Datadog installed. You have 10 million traces per day. Now what?

Most teams use Tracing only for debugging *after* an incident. "Why did the checkout fail at 2 AM?" -> Search Trace -> Found it.

**Advanced QA** uses Tracing proactively. We write tests that assert on the *shape* of the trace. "Did this API call create a circular dependency?" "Did this login request hit the database 50 times instead of 1?"

## TL;DR

- **Critical Path Analysis reveals bottlenecks**: Is the "Longest Path" in the graph shifting from DB to External API?
- **Fan-Out detection catches N+1 queries**: Counting spans of the same type reveals inefficiencies.
- **Trace-Based Tests automate verification**: Failing the build if a specific span is missing or invalid.

## The Needle in the Haystack

Manual visual inspection of traces is impossible at scale. You cannot stare at 10 million traces. Your eyes would melt.

You need **Trace Analytics**. We treat traces as **Structured Data**. A Trace is a Tree of Spans. QA writes queries against this Tree.

`count(spans) where service='billing' > 5` -> Fail.

## Structural Anomalies

A "Performance Regression" is not just "It is slower". It is often "The structure changed".

Week 1: `Frontend -> API -> DB`
Week 2: `Frontend -> API -> Auth -> UserProfile -> DB`

The latency might be the same (because of caching), but the *complexity* explodes. QA must detect these structural shifts before they become problems.

## Code Snippet: Analysing Traces for N+1 Problems

Using a trace analysis library (simulated) to validate OpenTelemetry data.

```javascript
/*
  trace-audit.spec.js
*/

// Simulated Trace Data (OpenTelemetry format-ish)
const mockTrace = {
    traceId: 'abc-123',
    spans: [
        { id: '1', name: 'GET /orders', parentId: null, duration: 100 },
        { id: '2', name: 'SELECT * FROM users', parentId: '1', duration: 10 },
        { id: '3', name: 'SELECT * FROM products', parentId: '1', duration: 10 },
        { id: '4', name: 'SELECT * FROM products', parentId: '1', duration: 10 },
        { id: '5', name: 'SELECT * FROM products', parentId: '1', duration: 15 },
        // ... imagine 50 more of these
    ]
};

function auditTrace(trace) {
    const issues = [];
    
    // 1. Detect N+1 problems (Repeated similar DB calls)
    const dbSpans = trace.spans.filter(s => s.name.startsWith('SELECT'));
    const queryCounts = {};
    
    dbSpans.forEach(s => {
        queryCounts[s.name] = (queryCounts[s.name] || 0) + 1;
    });
    
    for (const [query, count] of Object.entries(queryCounts)) {
        if (count > 2) { // Threshold
            issues.push(`N+1 Detected: '${query}' called ${count} times.`);
        }
    }
    
    return issues;
}

test('should fail trace audit if N+1 query pattern detected', () => {
    const issues = auditTrace(mockTrace);
    
    if (issues.length > 0) {
        console.error(issues);
    }
    
    expect(issues.length).toBe(0);
});
```

## Summary

Tracing is not just for Ops. It is a QA goldmine.

It allows "White Box" testing without looking at the code. You look at the execution flow. If the flow looks wrong, the code is wrong.

## Key Takeaways

- **Metadata enables filtering**: Ensure developers tag spans with `user_id`, `region`, and `version`. You cannot analyse what you cannot filter.
- **Sampling differs by environment**: In Prod, you sample 1%. In Test, sample 100%. Do not miss the bugs in CI.
- **Propagation must be verified**: Test that `traceparent` headers are correctly passed to third-party webhooks.

## Next Steps

- **Tool**: **Malabi** (Trace-based testing for JS) or **Tracetest.io**.
- **Learn**: Master the **OpenTelemetry** standard.
- **Goal**: Create a dashboard showing "Average Spans per Transaction" trend over time.
