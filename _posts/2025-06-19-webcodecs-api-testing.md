---
layout: post
title: 'WebCodecs API Testing: Going Low-Level'
date: 2025-06-19
category: QA
slug: webcodecs-api-testing
gpgkey: EBE8 BD81 6838 1BAF
tags: ['automation', 'backend-testing']
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Why the Video Element Was Not Enough](#why-the-video-element-was-not-enough)
- [The Buffer Dance](#the-buffer-dance)
- [Code Snippet: Frame-by-Frame Processing](#code-snippet-frame-by-frame-processing)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

For 25 years, the web had `<video src="movie.mp4">`. It was a black box. You
feed it a URL, it plays. Magic.

But what if you want to edit video frame-by-frame? Or build a cloud gaming
client? Or a Zoom-like app with custom low- latency encryption?

You need **WebCodecs**. It gives you raw access to the browser's **Hardware
Encoders/Decoders**.

**QA Challenge**: You are now manually managing the GPU memory. If you forget to
`close()` a frame, you crash the tab. No pressure.

## TL;DR

- **Low-Level control demands responsibility**: You handle chunks, keyframes,
  and timestamps directly.
- **Zero Copy is the goal**: Keep frames on the GPU. Reading a frame to CPU
  (`readPixels`) is slow.
- **Latency is measured in microseconds**: Not seconds. Not milliseconds.
  Microseconds.

## Why the Video Element Was Not Enough

The standard video tag is optimised for _playback_. It buffers 10 seconds ahead.
Lovely for watching cat videos.

For **Cloud Gaming** or **Remote Desktop**, 10 seconds is an eternity. You need
10ms. WebCodecs allows you to receive a packet via WebSocket, decode it
immediately, and paint it to a Canvas.

**QA Test**: Measure "Glass-to-Glass" latency. (Time from Camera Capture ->
Encode -> Network -> Decode -> Screen).

## The Buffer Dance

WebCodecs uses `VideoFrame` objects. These are wrappers around GPU textures.
They are **Reference Counted**.

If you do not call `frame.close()`, the GPU VRAM fills up. The browser will
eventually panic and kill your WebGL context. It is like forgetting to return
library books, except the library catches fire.

**QA Strategy**: "Soak Testing". Run your video encoder loop for 12 hours. Watch
the memory graph. It should be flat.

## Code Snippet: Frame-by-Frame Processing

Encoding generated video frames (e.g., from a Canvas animation).

```javascript
/*
  encoder.spec.js
*/

test('should encode frames without memory leaks', async () => {
  // 1. Configure the Encoder
  const outputChunks = [];
  const encoder = new VideoEncoder({
    output: (chunk, metadata) => {
      outputChunks.push(chunk);
      // console.log(`Encoded chunk size: ${chunk.byteLength}`);
    },
    error: (e) => console.error(e),
  });

  encoder.configure({
    codec: 'avc1.42002A', // H.264 Baseline Profile
    width: 640,
    height: 480,
    bitrate: 2_000_000, // 2 Mbps
    framerate: 30,
  });

  // 2. Generate Frames
  const canvas = new OffscreenCanvas(640, 480);
  const ctx = canvas.getContext('2d');

  for (let i = 0; i < 30; i++) {
    // Draw something (Blue background with frame number)
    ctx.fillStyle = `rgb(0, 0, ${i * 8})`;
    ctx.fillRect(0, 0, 640, 480);

    // Create VideoFrame from Canvas
    const frame = new VideoFrame(canvas, { timestamp: i * 33333 }); // 30fps = 33ms

    // Encode
    encoder.encode(frame, { keyFrame: i % 15 === 0 });

    // CRITICAL: Close the frame to free GPU memory
    frame.close();
  }

  // 3. Flush and Finish
  await encoder.flush();
  encoder.close();

  // Verification
  expect(outputChunks.length).toBeGreaterThan(0);
  // First chunk usually contains config options (AVCC)
  expect(outputChunks[0].type).toBe('key');
});
```

## Summary

WebCodecs is "Assembly Language" for video on the web.

It gives you incredible power but removes the safety rails of the `<video>` tag.
Your QA must focus heavily on **Resource Management** and **Error Recovery**
(what happens if the decoder crashes? Restart it!).

## Key Takeaways

- **Codec support varies**: Test support for H.264, VP8, VP9, and AV1. Not all
  browsers support all hardware acceleration.
- **Backpressure requires logic**: If decoding is faster than rendering, drop
  frames. If slower, you get lag. Test your queue logic.
- **Sync is your responsibility**: Audio and Video are separate streams now. You
  are responsible for lip syncing.

## Next Steps

- **Tool**: Use **Chrome://media-internals** to debug the hardware pipeline.
- **Learn**: Understand **I-Frames** (Keyframes), **P-Frames** (Predicted), and
  **B-Frames** (Bi-directional).
- **Experiment**: Build a simple screen recorder implementation using
  `getDisplayMedia` + WebCodecs.
