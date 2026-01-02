---
layout: post
title: 'Mocking SSE Events: Taming the Infinite Stream'
date: 2023-07-06
category: QA
slug: mocking-sse-events
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Stream Problem](#the-stream-problem)
- [Mock Service Worker (MSW) to the Rescue](#mock-service-worker-msw-to-the-rescue)
- [Code Snippet: Streaming with MSW](#code-snippet-streaming-with-msw)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Real-time data is everywhere. Stock tickers, chat apps, and that annoying "User X is typing..." bubble that gives you
anxiety.

The simplistic way to handle this is **WebSockets**. The simpler, often ignored way that works over standard HTTP is
**Server-Sent Events (SSE)**.

WebSockets are like a walkie-talkie: you can push and pull. SSE is like a podcast: you just shut up and listen.

Testing a connection that never closes is tricky. If your test waits for the connection to "finish", it will timeout
after 5000ms and fail. You need a way to mock infinity.

## TL;DR

- **Network Level mocking is best**: Do not mock the browser API (`EventSource`); mock the network request using MSW.
- **Timing needs stress testing**: Test how your UI handles a flood of events (e.g., 50 messages/second).
- **Reconnection needs verification**: What happens if the stream dies? Does your app auto-retry, or does it give up and
  cry?

## The Stream Problem

In a normal test:

1. App requests `/api/user`.
2. Mock returns JSON `{ name: "Bob" }`.
3. App renders "Bob". Test Passes.

With SSE:

1. App connects to `/api/stream`.
2. Mock keeps the connection open.
3. Mock sends "Event 1".
4. Mock sends "Event 2".
5. ...Mock never stops.

If your test is "Wait for the request to finish," you are doomed. You need to test the **intermediate states**.

## Mock Service Worker (MSW) to the Rescue

MSW is arguably the best thing to happen to frontend testing since `console.log`. It intercepts requests at the network
layer, meaning your app thinks it is talking to a real server.

Newer versions of MSW support **ReadableStreams**, which means we can emulate an SSE endpoint perfectly right inside our
Jest/Vitest suite. No backend required.

## Code Snippet: Streaming with MSW

Here is how to set up an MSW handler that pushes 3 events and then gracefully closes the connection.

```javascript
// mocks/handlers.js
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/live-scores', () => {
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        
        // Helper to send data (SSE format required)
        const send = (data) => {
            // Must have "data: " prefix and double newline suffix
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        // Send 3 updates with delays
        send({ score: '0-0' }); // Immediate
        
        setTimeout(() => send({ score: '1-0' }), 100);
        setTimeout(() => send({ score: '1-1' }), 200);
        
        // Close stream after 300ms so the test can finish
        setTimeout(() => controller.close(), 300);
      }
    });

    return new HttpResponse(stream, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  }),
];
```

In your test, you simply assert that the UI updates from "0-0" to "1-0" to "1-1".

## Summary

SSE is a beautiful protocol because it is lightweight (standard HTTP). But "infinite" requests break most traditional
testing patterns.

By controlling the stream time-travel style using mocks, you can verify that your application is responsive, not just
"loaded".

## Key Takeaways

- **Format needs precision**: SSE requires a specific text format (`data: ... \n\n`). If you miss the newlines, the
  browser ignores it.
- **Memory needs monitoring**: Be careful. If you render a new component for every event, a long-running tab will crash
  the browser. Test for memory leaks.
- **Cleanup needs implementing**: Always ensure your component calls `.close()` when it unmounts.

## Next Steps

- **Refactor**: Replace your WebSocket complexity with SSE if you do not need bi-directional comms.
- **Test**: Add a test case where the stream sends a "User Disconnected" event.
- **Chaos**: Using MSW, simulate a connection error halfway through the stream and assert that your client attempts to
  reconnect.
