---
layout: post
title: 'Edge Computing Testing: Latency is the Mind-Killer'
date: 2024-03-28
category: QA
slug: edge-computing-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:
- edge-computing
- performance
- strategies
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Cold Start" Winter](#the-cold-start-winter)
- [Global State Consistency](#global-state-consistency)
  - [QA Scenario: "The Stale Update"](#qa-scenario-the-stale-update)
- [Code Snippet: Unit Testing Edge Workers](#code-snippet-unit-testing-edge-workers)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

"Edge Computing" sounds fancy. It just means running your code on a server that is geographically closer to the user
(and usually less powerful than your iPhone).

Cloudflare Workers, AWS Lambda@Edge, Vercel Edge Functions. They promise speed. They deliver debugging nightmares.

QA's job is to ensure that "fast" does not mean "broken".

## TL;DR

- **Timeouts are strict**: Edge functions have strict CPU limits (e.g., 10ms wall time). No heavy maths allowed.
- **APIs are limited**: Most Node.js APIs (`fs`, `child_process`) do not exist here. Mock everything.
- **Logs are delayed**: `console.log` might show up 5 minutes late. Do not rely on it for real-time debugging.

## The "Cold Start" Winter

Serverless functions "sleep" when not used. The first user to wake them up pays a "Cold Start" penalty (latency).

**QA Test**:

1. Hit the endpoint. Record Latency (e.g., 500ms).
2. Hit it again immediately. Record Latency (e.g., 50ms).

If the delta is huge, your user experience is inconsistent. You might need to implement a "Warm-Up" ping.

## Global State Consistency

If I update a database record in New York, when does the user in Tokyo see it?

Edge nodes cache data aggressively.

### QA Scenario: "The Stale Update"

1. User A (NY) modifies data.
2. Verify Edge A (NY) sees change.
3. Verify Edge B (Tokyo) sees change.

If Edge B is still serving old data, you have an "Eventual Consistency" problem (or a cache invalidation bug).

## Code Snippet: Unit Testing Edge Workers

We can emulate the Edge environment locally using `vitest` or `jest-environment-miniflare`. Edge workers typically use
the `Request` / `Response` Web Standard API.

```javascript
/* 
  worker.test.js
  Testing a Cloudflare Worker/Edge Function
*/
import { describe, it, expect } from 'vitest';

// The Worker Logic (usually imported from src/worker.js)
const worker = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/hello") {
      return new Response("Hello Edge!", { status: 200 });
    }
    return new Response("Not Found", { status: 404 });
  },
};

describe('Edge Worker', () => {
  it('responds with Hello Edge', async () => {
    // Construct a standard Fetch Request
    const req = new Request('https://example.com/hello');
    
    // Invoke the worker logic directly
    const res = await worker.fetch(req, {}, {});
    
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('Hello Edge!');
  });

  it('handles 404', async () => {
    const req = new Request('https://example.com/nowhere');
    const res = await worker.fetch(req, {}, {});
    
    expect(res.status).toBe(404);
  });
});
```

## Summary

Edge computing is great for simple logic (redirects, header manipulation, A/B testing). It is terrible for complex
business logic.

Keep the edge "thin". Keep the complexity in the core.

## Key Takeaways

- **Environment variables sync slowly**: Syncing secrets across 500 edge locations takes time. Test for "Partial
  Rollout" failure states.
- **Analytics need server-side logging**: You cannot install Google Analytics on the server easily. You might need
  server-side logging.
- **Headers need verification**: Test that security headers (HSTS, CSP) are actually being injected by the edge worker.

## Next Steps

- **Tool**: Use **Miniflare** (for Cloudflare) or **Vercel CLI** to simulate the edge locally.
- **Learn**: Read about **CRDTs** (Conflict-free Replicated Data Types) if you want to be a stateful edge wizard.
- **Audit**: Check if your edge worker is crashing silently on exceptions (install a Sentry adapter for Workers).
