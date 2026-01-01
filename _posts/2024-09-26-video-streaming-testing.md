---
layout: post
title: 'Video Streaming Testing: Buffering is the Mind-Killer'
date: 2024-09-26
category: QA
slug: video-streaming-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [HLS vs DASH](#hls-vs-dash)
- [The Buffer Health](#the-buffer-health)
- [Code Snippet: Monitoring Buffer Stalls](#code-snippet-monitoring-buffer-stalls)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

We live in the era of Netflix and TikTok. If your video takes 3 seconds to load, the user scrolls away.

Video QA is not just "does it play?". It is "Does it start instantly?", "Does it look crisp?", and "Does it stop buffering when my flatmate turns on the microwave?".

Quality of Experience (QoE) is the metric that matters.

## TL;DR

- **Startup Time matters**: Time to First Frame (TTFF). Should be < 200ms.
- **ABR must adapt**: Adaptive Bitrate. Does it switch from 1080p to 360p when I walk into a lift? Or does it stall?
- **DRM blocks playback**: Digital Rights Management. Does the browser refuse to play because of copyright protection? (Widevine/FairPlay).

## HLS vs DASH

**HLS** (Apple): `.m3u8` playlists. Standard on mobile.
**DASH** (MPEG): `.mpd` manifests. Standard everywhere else.

They work similarly: chop video into 10-second (or 2-second) chunks. Client downloads chunks.

**QA Strategy**: Corrupt one chunk (return 404). Does the player skip it or crash? Does the player handle the "Discontinuity" tag (e.g., ad break insertion)?

## The Buffer Health

The "Buffer" is the tank of petrol. If the tank is empty, the car stops (Rebuffering event / Spinner of Death). If the tank is full, you are wasting data (if the user stops watching).

You want a healthy buffer (e.g., 30 seconds ahead).

**QA Check**: Throttle network to 500kbps. Watch the buffer drain. Does the player downgrade quality *before* the buffer hits 0?

## Code Snippet: Monitoring Buffer Stalls

You can hook into the HTML5 Video events (`waiting`, `stalled`, `playing`) to count stalls.

```javascript
/*
  video.spec.js
*/
const { test, expect } = require('@playwright/test');

test('should play video without buffering', async ({ page }) => {
  await page.goto('/movie');
  
  // Inject event listeners to track "waiting" events
  const playbackStats = await page.evaluate(async () => {
    let stalls = 0;
    const video = document.querySelector('video');
    
    if (!video) return { error: 'No video element' };

    video.addEventListener('waiting', () => {
      stalls++;
      console.log('Video stalled!');
    });

    // Start playback
    video.muted = true; // Browser policy forbids unmuted autoplay
    await video.play();

    // Play for 10 seconds
    await new Promise(r => setTimeout(r, 10000));
    
    return { stalls, currentTime: video.currentTime };
  });

  expect(playbackStats.stalls).toBe(0); // Ideally 0 stalls
  expect(playbackStats.currentTime).toBeGreaterThan(9); // Played ~10s
});
```

## Summary

Video engineering is magical deep tech. Video QA is about staring at a "Loading..." spinner and crying.

But when it works, and the transition from 480p to 4K is seamless, it is art. Do not be the service that buffers during the climax of the film.

## Key Takeaways

- **Seek needs testing**: Scrubbing the timeline. Does it snap to the nearest Keyframe (I-frame)? If I seek to 50:00, does it take 10s to load?
- **Subtitles need verification**: WebVTT. Do they sync? Do they handle special characters? Do they render correctly on mobile?
- **Autoplay Policy is strict**: Browsers block autoplay with sound. You *MUST* start muted. Verify this logic or your conversion rate is 0.

## Next Steps

- **Tool**: Use **FFmpeg** to generate test streams with specific bitrate and corruption. It is the Swiss Army Knife of video.
- **Learn**: Read about **CDNs** and Edge Caching. Video is heavy; you need servers everywhere.
- **Audit**: Check your "End of Stream" behaviour. Does it loop? Show related videos? Or just go black?
