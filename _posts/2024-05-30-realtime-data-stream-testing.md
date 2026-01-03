---
layout: post
title: 'Real-Time Data Stream Testing: Catching Water with a Sieve'
date: 2024-05-30
category: QA
slug: realtime-data-stream-testing
gpgkey: EBE8 BD81 6838 1BAF
tags: ["data-engineering", "real-time", "data-testing"]
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Firehose" Problem](#the-firehose-problem)
- [The "Late Arrival" Chaos](#the-late-arrival-chaos)
- [Code Snippet: Testing WebSockets with Playwright](#code-snippet-testing-websockets-with-playwright)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Real-time data streams (WebSockets, SSE, Kafka) are like drinking from a firehose. Traditional QA says: "Send request,
wait for response."

Streaming QA says: "Open connection, wait for... something... eventually."

It requires a shift in mindset from "Request/Response" to "Event-Driven" chaos. If you are testing a chat app, finding
the message "Hello" is easy. Finding the message "Hello" when 500 other people are spamming emojis is hard.

## TL;DR

- **Protocol differs by use case**: WebSockets (Bidirectional) vs SSE (Unidirectional) vs Long Polling (Legacy sadness).
- **Reconnection needs testing**: What happens when the WiFi drops for 2 seconds? Does the stream resume or die?
- **Ordering can be chaotic**: Messages often arrive out of order. Does your UI handle `timestamp: 10:01` arriving
  *before* `timestamp: 10:00`?

## The "Firehose" Problem

Your dev team built a dashboard that updates 100 times per second. The browser renders at 60 FPS. The fan on your laptop
spins up like a jet engine.

**QA Test**: Leave the dashboard open for 24 hours. Does the memory usage stick to 100MB, or does it consume 16GB RAM
and crash Chrome? This is a memory leak test, masquerading as a functional test.

## The "Late Arrival" Chaos

In the real world, packets get lost. A user on a train enters a tunnel. They emerge 30 seconds later. The server sends
50 "missed" messages at once.

Does the UI:
A) Process them gracefully?
B) Freeze for 10 seconds?
C) Show the notifications in reverse order?
(It is usually C).

## Code Snippet: Testing WebSockets with Playwright

Playwright has native support for inspecting WebSocket frames. It makes testing sockets almost as easy as testing REST.

```javascript
/*
  websocket.spec.js
*/
const { test, expect } = require('@playwright/test');

test('should receive stock price update via WebSocket', async ({ page }) => {
  // Navigate to page
  await page.goto('/stocks');

  // Wait for the specific WebSocket connection to open
  const wsPromise = page.waitForEvent('websocket', ws => ws.url().includes('ticker'));
  const ws = await wsPromise;

  // Wait for a frame containing "AAPL" (filtering the noise)
  console.log("Waiting for AAPL data...");
  const framePromise = ws.waitForEvent('framereceived', frame => {
    const payload = JSON.parse(frame.payload());
    return payload.symbol === 'AAPL';
  });

  // Verify the UI updates eventually
  await expect(page.locator('.stock-price-aapl')).toContainText('$');
  
  // Verify the underlying data
  const frame = await framePromise;
  console.log('Received stock update:', frame.payload());
});
```

## Summary

Testing streams is about testing **resilience**. Ideally, the stream flows like a gentle river. In reality, it is a
tsunami of JSON.

Your job is to build the dam.

## Key Takeaways

- **Heartbeat keeps connections alive**: Every WebSocket needs a "ping/pong" mechanism to keep the connection alive
  through load balancers (AWS ALB kills idle connections after 60s).
- **Backpressure prevents overflow**: If the client cannot process messages fast enough, the server must slow down (or
  drop messages).
- **Idempotency prevents duplicates**: If the same message arrives twice, do you credit the user's account twice? Using
  a unique `message_id` handles this.

## Next Steps

- **Tool**: Use **Postman** (now supports WebSocket) or **k6** for load testing streams (k6 supports WebSockets
  natively).
- **Learn**: Understand **Event Loops** in JavaScript to know why rendering blocks processing.
- **Audit**: Check your network tab. If you see thousands of HTTP polling requests, someone failed to implement
  WebSockets and fell back to Long Polling. Shame them.
