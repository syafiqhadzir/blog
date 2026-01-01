---
layout: post
title: 'Edge AI Testing: Bringing the Brain to the Browser'
date: 2025-03-27
category: QA
slug: edge-ai-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- ai
- qa
- testing
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Mobile Melt" Problem](#the-mobile-melt-problem)
- [Quantization (Shrinking the Brain)](#quantization-shrinking-the-brain)
- [Code Snippet: Profiling Inference Time](#code-snippet-profiling-inference-time)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Cloud AI is great, but it costs money, requires 5G, and sends user data to a server (Privacy nightmare).

Edge AI runs in the user's browser (TensorFlow.js, ONNX, WebLLM). It is free (for you) and works offline. But it also turns the user's iPhone into a toaster.

QA's job is to ensure we do not drain the battery in 5 minutes or crash the tab due to memory pressure.

## TL;DR

- **Heat testing is literal**: Touch the device. Is it hot? If the OS throttles the CPU to cool down, your app will lag.
- **Memory limits are strict**: Mobile browser tabs crash at ~2GB. Your model better not utilise 1.9GB.
- **Latency frustrates users**: If the UI freezes for 3 seconds whilst "Thinking", the user will rage-quit. Use Web Workers.

## The "Mobile Melt" Problem

Running a Neural Network on a standard Snapdragon processor is intense. If your inference loop runs at 60fps (e.g., real-time face tracking), you are maxing out the GPU.

QA needs to test on **Low-End Devices**. Testing on a MacBook Pro M3 is cheating. The M3 has a dedicated Neural Engine. Test on a £100 Android from 2020. That is your reality check.

## Quantization (Shrinking the Brain)

To make models fit, developers "Quantise" them (convert 32-bit floats to 8-bit integers). This makes them 4x smaller and faster, but "dumber".

**QA must verify**:

1. **Speed**: Is it actually faster? (Usually yes).
2. **Accuracy**: Did we lose too much IQ?

Compare the "Gold Standard" output (Server fp32) with the "Edge" output (Client int8). If the Client thinks a "Dog" is a "Cat", you quantised too hard.

## Code Snippet: Profiling Inference Time

Use the Performance API to measure how long the brain takes to think. Note: WebGL/WebGPU operations are asynchronous. You must `await` the result data to measure true time.

```javascript
/*
  benchmark.js
*/
async function benchmarkModel(model, inputTensor) {
    console.log("🔥 Warming up GPU shaders...");
    // Warmup run (Shaders need compilation, costs ~500ms first time)
    model.predict(inputTensor); 
    
    console.log("⏱️ Starting benchmark...");
    const start = performance.now();
    
    // Run Inference
    const result = model.predict(inputTensor);
    
    // CRITICAL: Force WebGL sync (otherwise it returns instantly but isn't done)
    const data = await result.data(); 
    
    const end = performance.now();
    const duration = end - start;
    
    console.log(`🧠 Inference Time: ${duration.toFixed(2)}ms`);
    
    // Budget check: 16ms = 60fps | 33ms = 30fps
    if (duration > 33) {
        console.warn("⚠️  Too slow for 30fps real-time usage.");
    } else {
        console.log("🚀 Real-time ready!");
    }
    
    // Memory cleanup (TensorFlow.js doesn't Garbage Collect automatically!)
    result.dispose(); 
    inputTensor.dispose();
}
```

## Summary

Edge AI is the ultimate "Shift Left". You are shifting the compute (and cost) to the user. Just make sure you do not shift the *blame* to the user when their phone crashes.

Memory management in JS is usually automatic. In TF.js, it is manual (`tf.dispose()`). If you miss one dispose, you kill the tab.

## Key Takeaways

- **WebAssembly provides stability**: Use the WASM backend for CPU inference if WebGL is flaky on old drivers. It is slower but more stable.
- **WebGPU is the future**: It provides near-native performance. Feature-detect it; do not assume it exists.
- **Download Size matters**: A 50MB model will not load on 3G without a progress bar. Cache it aggressively with Service Workers.

## Next Steps

- **Tool**: Use **Chrome DevTools Performance Monitor** to watch GPU usage. If it hits 100%, you are one second away from a crash.
- **Learn**: Read about **TFJS Converter** and **Graph Models**.
- **Experiment**: Build an "Object Detector" that runs in a Service Worker to unblock the UI thread.
