---
layout: post
title: 'Ultra-Low Latency Testing: When Milliseconds Feel Like Hours'
date: 2025-04-10
category: QA
slug: ultra-low-latency-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [WebSockets vs. WebTransport (UDP)](#websockets-vs-webtransport-udp)
- [The "Glass-to-Glass" Benchmark](#the-glass-to-glass-benchmark)
- [Code Snippet: Measuring Jitter](#code-snippet-measuring-jitter)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

In High-Frequency Trading (HFT) or Cloud Gaming (Stadia, GeForce Now), 50ms is acceptable. 100ms is failure.

We are moving towards a "Tactile Internet" where remote surgery and VR require sub-10ms response times. Testing this is
hard because your *monitoring tool* likely introduces more latency than the app itself.

Welcome to the Heisenberg Uncertainty Principle of QA: Measuring the lag creates lag.

## TL;DR

- **Protocol choice matters**: TCP is safe but slow (Retries upon failure). UDP is fast but chaotic (Fire and Forget).
- **Jitter matters more than average**: Latency is not just about the "Average" (Mean); it is about the "Standard
  Deviation" (Jitter). A consistent 50ms is better than a fluctuating 20-200ms.
- **Clock sync is essential**: You cannot measure One-Way Latency if the Client and Server clocks are 500ms apart
  (Drift). Use Round Trip Time (RTT).

## WebSockets vs. WebTransport (UDP)

WebSockets use TCP. TCP guarantees delivery, but if one packet is lost, *everything* waits (Head-of-Line Blocking).

WebTransport (built on HTTP/3 and QUIC) uses UDP semantics. If a packet is lost, we ignore it and move on.

Imagine a Video Call: If a frame is dropped, do you want to pause the video to wait for it (TCP), or just show the next
frame (UDP)?

**QA must verify**: "Does the app crash if 10% of UDP packets disappear?" (Spoiler: Yes, your custom parser will
probably choke on the missing sequence number).

## The "Glass-to-Glass" Benchmark

This means: Time from "Mouse Click" (Glass of the input) to "Action Visible" (Glass of the monitor).

You cannot test this with Selenium or Playwright alone. You test this with a **240fps High-Speed Camera** filming the
user's hand and screen simultaneously. Count the frames between the click and the pixel change.

Yes, we are doing *physical* QA now.

## Code Snippet: Measuring Jitter

Since high-speed cameras are expensive, here is a JS way to approximate network stability using the Application Layer.

```javascript
/*
  latency-monitor.js
*/
let pingHistory = [];

function startPingLoop(socket) {
    setInterval(() => {
        const start = performance.now();
        // Send a lightweight heartbeat
        socket.send(JSON.stringify({ type: 'ping', ts: start }));
    }, 1000);

    socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'pong') {
            const now = performance.now();
            // Calculate Round Trip Time
            const rtt = now - msg.ts; 
            
            pingHistory.push(rtt);
            // Keep last 60 seconds
            if (pingHistory.length > 60) pingHistory.shift();
            
            analyseJitter();
        }
    };
}

function analyseJitter() {
    if (pingHistory.length < 10) return;
    
    // Average
    const avg = pingHistory.reduce((a, b) => a + b) / pingHistory.length;
    
    // Variance -> Standard Deviation (Jitter)
    const variance = pingHistory.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / pingHistory.length;
    const jitter = Math.sqrt(variance);
    
    console.log(`📡 RTT: ${avg.toFixed(2)}ms | Jitter: ${jitter.toFixed(2)}ms`);
    
    // QA Alert
    if (jitter > 20) {
        console.warn("⚠️  Unstable connection! Jitter > 20ms. Switch to Low-Bandwidth Mode.");
    }
}
```

## Summary

Latency is the new downtime.

If your game lags, users quit. If your trading terminal lags, users lose money (£££). QA must stop looking at "Success
Rate" (Did the packet arrive?) and start looking at "P99 Latency" (Did it arrive *in time*?).

## Key Takeaways

- **Nagle's Algorithm kills real-time**: Ensure `TCP_NODELAY` is enabled on the server config. Nagle buffers small
  packets to save bandwidth, but it destroys real-time latency.
- **Garbage Collection causes spikes**: In JS, a generic GC pause takes ~50ms. That is 3 frames dropped. Optimise your
  memory access (Object Pools) to avoid GC spikes.
- **Regional QA is essential**: Test from Australia. We always forget Australia. Their ping to US-East is 250ms+
  physically.

## Next Steps

- **Tool**: Use **Wireshark** to look for TCP Retransmissions (Black lines).
- **Learn**: Read about **NTP (Network Time Protocol)** and **PTP (Precision Time Protocol)** depending on your accuracy
  needs.
- **Experiment**: Build a simple "Echo" server and try to play it over a VPN to simulate lag.
