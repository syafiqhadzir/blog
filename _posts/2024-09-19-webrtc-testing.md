---
layout: post
title: 'WebRTC Testing: Can You Hear Me Now?'
date: 2024-09-19
category: QA
slug: webrtc-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:
- strategies
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Magic of P2P (and why firewalls hate it)](#the-magic-of-p2p-and-why-firewalls-hate-it)
- [Packet Loss and Jitter](#packet-loss-and-jitter)
- [Code Snippet: Analysing WebRTC Internals](#code-snippet-analysing-webrtc-internals)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

WebRTC allows browsers to talk directly to each other. No servers (mostly).

It enables Zoom, Google Meet, and that weird chat app you built in a hackathon that only works on localhost. Testing it
is hard because it relies on UDP, which is unreliable by design.

"I sent the video frame. Did you get it?"
"..."
"Hello?"

Testing "Real-time" means testing the laws of physics and the chaos of the public internet.

## TL;DR

- **Connectivity needs verification**: Can User A connect to User B through a strict corporate firewall? (STUN vs TURN).
- **Quality degrades with packet loss**: What happens when 10% of packets are lost? Does the video freeze, pixelate, or
  just give up?
- **Mute is surprisingly complex**: The hardest feature to test. "I am hardware muted, but software unmuted." Chaos.

## The Magic of P2P (and why firewalls hate it)

Peer-to-Peer means my IP address talks to your IP address. This is fast.

But corporate firewalls hate it. They block everything that is not HTTP (Port 80/443). So we use TURN servers (Relays).

**QA Strategy**:

1. **Direct**: Test on same WiFi.
2. **STUN**: Test across different networks (Home vs 4G).
3. **TURN**: Block P2P traffic on your router (UDP blocking) and verify the app falls back to the Relay server. If it
fails, your enterprise customers will churn.

## Packet Loss and Jitter

**Packet Loss**: Missing pieces of the puzzle. The video glitches.
**Jitter**: Pieces arriving in the wrong order. The audio sounds robotic.

WebRTC tries to fix this with "Jitter Buffers". If the buffer is too small, audio is robot-y. If too large, audio is
delayed (latency), and you interrupt each other constantly.

Test on a bad WiFi connection (or simulate it with "Clumsy" on Windows).

## Code Snippet: Analysing WebRTC Internals

Chrome exposes a goldmine of data at `chrome://webrtc-internals`. You can access this Programmatically via `getStats()`.

```javascript
/*
  webrtc.spec.js
*/
const { test, expect } = require('@playwright/test');

test('should maintain low packet loss', async ({ page }) => {
  await page.goto('/video-call');
  await page.click('#start-call');
  
  // Wait for remote video to actually start flowing
  await page.waitForSelector('video#remote-video', { state: 'visible' });

  // Poll WebRTC Stats after 5 seconds
  await page.waitForTimeout(5000);

  const stats = await page.evaluate(async () => {
    // Note: You must expose the RTCPeerConnection object to window for this to work
    // window.pc = new RTCPeerConnection(...);
    if (!window.pc) return { error: 'PeerConnection not found' };

    const report = await window.pc.getStats();
    let packetsLost = 0;
    let packetsReceived = 0;

    report.forEach(stat => {
      if (stat.type === 'inbound-rtp' && stat.kind === 'video') {
         packetsLost = stat.packetsLost;
         packetsReceived = stat.packetsReceived;
      }
    });
    
    return { packetsLost, packetsReceived };
  });

  console.log('WebRTC Stats:', stats);
  
  // Assertions
  expect(stats.packetsReceived).toBeGreaterThan(0);
  // Allow some loss, but not catastrophic
  expect(stats.packetsLost).toBeLessThan(50); 
});
```

## Summary

WebRTC testing is about testing the "Network Conditions" more than the code. Your code works fine. The internet is
broken.

Make your app survive the internet. If your app only works on good WiFi, it is not a production app; it is a demo.

## Key Takeaways

- **Echo Cancellation needs handling**: If you hear yourself, the AEC (Acoustic Echo Cancellation) failed. This is
  usually a browser/OS issue, but your app needs to handle it (e.g., warn the user to use headphones).
- **Simulcast enables quality switching**: Sending Low, Med, and High quality streams simultaneously. Verify the
  receiver switches to "Low 180p" when bandwidth drops, instead of buffering the "High 1080p" stream.
- **Permissions cause support tickets**: "Microphone Access Denied" is the #1 support ticket. Handle it with a nice UI,
  not a crash.

## Next Steps

- **Tool**: Use **testRTC** or **Kite** for enterprise-grade WebRTC automation. They spin up docker containers globally.
- **Learn**: Understand **SDP** (Session Description Protocol). It is the handshake letter where the browsers agree on
  codecs (VP8 vs H.264).
- **Audit**: Are you leaking IP addresses? (WebRTC leak). Use a VPN to check.
