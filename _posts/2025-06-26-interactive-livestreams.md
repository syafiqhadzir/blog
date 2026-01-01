---
layout: post
title: "Interactive Livestreams: Testing the \"Now\""
date: 2025-06-26
category: QA
slug: interactive-livestreams
gpgkey: "EBE8 BD81 6838 1BAF"
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Sync Problem](#the-sync-problem)
- [The Thundering Herd](#the-thundering-herd)
- [Code Snippet: Syncing Events with SEI Metadata](#code-snippet-syncing-events-with-sei-metadata)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

In typical telly, there is a 30-second delay. It does not matter.

In **Interactive Livestreams** (Twitch, Betting, Live Auctions, HQ Trivia), latency matters enormously. If the host asks "What is 2+2?" and you see the question 10 seconds *after* the polling window closes, the app is broken.

QA is no longer testing "does video play". You are testing **Time**.

## TL;DR

- **Latency budget is tight**: Ultra-Low Latency (ULL) targets 2-5 seconds. Real-Time (WebRTC) targets under 500ms.
- **Metadata must sync precisely**: Polls, overlays, and buy buttons must trigger exactly when the video frame appears.
- **Scale amplifies problems**: 100,000 users clicking "Vote" at the exact same millisecond creates chaos.

## The Sync Problem

If you send the "Show Poll" command via WebSocket, and the video via HLS (HTTP Live Streaming), they arrive at different times.

HLS is delayed by 10-20 seconds. WebSocket is instant. Result: The user sees the poll **Spoiler** before the host even finishes asking the question. This is not a bug. It is a fundamental architecture problem.

**Solution**: Embed the "Trigger Timestamp" directly into the video stream using **SEI (Supplemental Enhancement Information)** or ID3 tags.

## The Thundering Herd

When the host says "Click Now!", 100k users hit your API at once. This is not a normal load test. This is an instantaneous spike. The graph looks like a heart attack.

**QA Strategy**: Use a "Sledgehammer" load test. Spin up 10,000 bots. Keep traffic at 0. Then, at T=10s, have ALL of them hit `POST /vote`. If your Load Balancer or Database falls over, you fail.

## Code Snippet: Syncing Events with SEI Metadata

Video players (like hls.js or flv.js) expose metadata events. We use this to trigger UI exactly on the right frame.

```javascript
/*
  player-sync.spec.js
*/

test('should display overlay when SEI metadata matches current video time', async () => {
    // Mock Video Element
    const video = document.createElement('video');
    
    // Mock Event Stream
    const seiEvents = [
        { triggerTime: 10.5, payload: { type: 'SHOW_POLL', id: 'poll-123' } },
        { triggerTime: 15.0, payload: { type: 'HIDE_POLL', id: 'poll-123' } }
    ];
    
    // The "Engine" that listens to video time updates
    const overlayManager = new OverlayManager(video);
    const showSpy = jest.spyOn(overlayManager, 'showPoll');
    
    // Simulate Video Playback
    video.currentTime = 10.4;
    overlayManager.check(seiEvents);
    expect(showSpy).not.toHaveBeenCalled();
    
    // Time advances to 10.6 (Crossing the 10.5 threshold)
    video.currentTime = 10.6;
    overlayManager.check(seiEvents);
    
    expect(showSpy).toHaveBeenCalledWith('poll-123');
});

// A simple implementation of the Manager
class OverlayManager {
    constructor(video) {
        this.video = video;
        this.lastCheckedTime = 0;
    }
    
    check(events) {
        const now = this.video.currentTime;
        
        // Find events that happened between last check and now
        const pending = events.filter(e => 
            e.triggerTime > this.lastCheckedTime && e.triggerTime <= now
        );
        
        pending.forEach(e => {
            if (e.payload.type === 'SHOW_POLL') this.showPoll(e.payload.id);
        });
        
        this.lastCheckedTime = now;
    }
    
    showPoll(id) {
        console.log(`Displaying Poll ${id}`);
    }
}
```

## Summary

The difference between a "Stream" and an "Experience" is interactivity.

Testing this requires a holistic view of the pipeline: Ingest -> Transcode -> CDN -> Player -> UI Layer. Do not just test the frontend. Test the **Network Packets**.

## Key Takeaways

- **Drift accumulates silently**: Over an hour, does audio drift from video? Does the poll drift from the video?
- **Reconnection breaks state**: If I switch from Wi-Fi to 4G, do I miss the poll? (State Reconciliation).
- **Security gaps exist**: Can I vote twice? Can I vote after the window closed by sniffing the API?

## Next Steps

- **Tool**: **OBS Studio** for injecting metadata into your test streams.
- **Learn**: Read about **WebRTC Data Channels** (send data inside the video connection, 0ms diff).
- **Framework**: **Socket.io** is often not fast enough for Mass Scale. Look at **NATS** or **Redis streams**.
