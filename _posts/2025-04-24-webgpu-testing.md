---
layout: post
title: 'WebGPU Testing: The Browser is now a Supercomputer'
date: 2025-04-24
category: QA
slug: webgpu-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:
- emerging-tech
- strategies
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Vertex vs. Fragment vs. Compute (The Trinity)](#vertex-vs-fragment-vs-compute-the-trinity)
- [Memory Leaks in VRAM (The Silent Killer)](#memory-leaks-in-vram-the-silent-killer)
- [Code Snippet: Running a Compute Shader](#code-snippet-running-a-compute-shader)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

WebGL was cute. It let us draw triangles in 2011.

WebGPU is a monster. It gives you direct access to the GPU for "General Purpose Compute" (GPGPU). This means you can run
complex simulations (Fluid Dynamics), massive AI models (LLMs), or mining algorithms directly in JavaScript.

Or you can crash the user's entire Graphics Driver and BSOD (Blue Screen of Death) their machine. QA's job is to prevent
the latter.

## TL;DR

- **Compute Shaders run on the GPU**: Logic that runs on the GPU, not the CPU. Highly parallel. Hard to debug because
  `console.log` does not exist inside a shader.
- **Resource limits are strict**: 2GB of VRAM is your budget (usually). Exceed it, and the tab dies. Different GPUs have
  different limits (Buffer Size, Texture Dimensions).
- **Async is everywhere**: Everything in WebGPU is asynchronous. `mapAsync`, `onSubmitWorkDone`. It is a race condition
  minefield.

## Vertex vs. Fragment vs. Compute (The Trinity)

- **Vertex**: Where are the points? (Geometric QA). Is the 3D model distorted?
- **Fragment**: What colour are the pixels? (Visual QA). Is the lighting correct?
- **Compute**: Physics, AI, Maths. (Data QA).

If you are testing a WebGPU app, you are likely testing a "Simulation". Check the *numbers* coming out of the simulation
buffer, not just the pretty pictures. If the Physics engine says gravity is `9.8` but the ball floats, the Compute
Shader logic is broken.

## Memory Leaks in VRAM (The Silent Killer)

In JavaScript, the Garbage Collector (GC) saves you. In WebGPU, you manually allocate buffers (`createBuffer`). If you
do not `destroy()` them, they stay in VRAM forever.

**Test Scenario**:

1. Open App (Task Manager: GPU Memory 200MB).
2. User performs "Heavy Action" (Load 3D Scene). (GPU Memory 800MB).
3. User resets/closes Scene. (GPU Memory SHOULD go back to 200MB).
4. If it stays at 800MB, you have a VRAM leak. Three clicks later, the machine freezes.

## Code Snippet: Running a Compute Shader

Here is the "Hello World" of parallel computing on the web. We calculate values in parallel on the GPU and read them
back to JS.

```javascript
/*
  webgpu-compute.spec.js
*/
const { test, expect } = require('@playwright/test');

test('should execute parallel compute shader', async ({ page }) => {
  // WebGPU requires HTTPS or localhost
  await page.goto('https://localhost:3000/compute-demo');

  const result = await page.evaluate(async () => {
    if (!navigator.gpu) return 'Not Supported';
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();

    // 1. Array of data: [0, 1, 2, 3]
    const data = new Float32Array([0, 1, 2, 3]);
    
    // 2. Create GPU Buffer
    const buffer = device.createBuffer({
        size: data.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
    });
    new Float32Array(buffer.getMappedRange()).set(data);
    buffer.unmap();

    // 3. Define Shader (WGSL) - Multiply every number by 2
    const shaderCode = `
      @group(0) @binding(0) var<storage, read_write> outputBuffer: array<f32>;
      @compute @workgroup_size(64)
      fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
        let index = global_id.x;
        // Logic: val * 2
        outputBuffer[index] = outputBuffer[index] * 2.0;
      }
    `;
    const shaderModule = device.createShaderModule({ code: shaderCode });

    // 4. Create Pipeline and Dispatch
    // ... (omitted boilerplate for BindGroup and Pipeline layout) ...
    // ... commandEncoder.beginComputePass() ...
    // ... pass.dispatchWorkgroups(1) ...

    // 5. Read Back Buffer
    // ... copyBufferToBuffer ...
    // ... mapAsync ...
    
    // For this snippet, assume we return the processed array
    return [0, 2, 4, 6]; 
  });

  if (result !== 'Not Supported') {
       expect(result).toEqual([0, 2, 4, 6]);
  }
});
```

## Summary

WebGPU brings "Console Quality" graphics to the web. It also brings "Console Quality" complexity and crashes.

Your testing must go beyond "Functional" and into "Systems Engineering". You are managing memory, synchronisation, and
parallelism.

## Key Takeaways

- **WGSL requires learning**: The WebGPU Shading Language is like Rust and C++ had a baby. You need to learn it to read
  the code. It is stricter than GLSL.
- **Device Loss must be handled**: The GPU *will* crash (TDR - Timeout Detection and Recovery). Handle the `device.lost`
  promise gracefully. Do not let the page freeze white.
- **Test on bleeding edge**: Always test on Canary/Nightly. WebGPU implementations are bleeding edge.

## Next Steps

- **Tool**: Use **PIX on Windows** or **RenderDoc** (if you can attach to the browser process) to step through GPU
  frames.
- **Learn**: Read **"WebGPU Fundamentals"** (the website). It is the bible.
- **Audit**: Are you checking `device.limits.maxStorageBufferBindingSize`? If you try to bind a buffer larger than the
  hardware supports, it crashes.
