---
layout: post
title: 'WebNN API Testing: Burning User Batteries'
date: 2025-04-17
category: QA
slug: webnn-api-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:
- emerging-tech
- strategies
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [AI in the Browser (Shift Left... Far Left)](#ai-in-the-browser-shift-left-far-left)
- [Hardware Acceleration (NPU/GPU)](#hardware-acceleration-npugpu)
- [Code Snippet: Building a Graph](#code-snippet-building-a-graph)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Training AI happens in the cloud (Nvidia H100s). Running AI (Inference) is moving to the Edge... literally to your
browser.

The Web Neural Network API (WebNN) allows JS to access the specialised AI chips (NPU) on your phone. This enables
background blur, face detection, and noise cancellation *without* sending data to a server.

Privacy win? Yes. Battery loss? Also yes. If your website makes my phone hot enough to fry an egg, I am closing the tab.

## TL;DR

- **Inference is what WebNN does**: Running the model to get a prediction. It optimises `matmul` (Matrix
  Multiplication).
- **Ops vary by browser**: Mathematical operations (clamp, conv2d, matmul). Not all browsers support all Ops yet.
- **Backend differences cause drift**: Testing against CPU vs GPU vs NPU backends. The results might differ slightly
  (Floating Point drift).

## AI in the Browser (Shift Left... Far Left)

Why do this?

1. **Privacy**: Data (Medical images, Webcam feed) never leaves the device.
2. **Latency**: Zero network lag. No "Loading..." spinner.
3. **Cost**: You pay for the user's electricity, not AWS GPU hours (£££).

**QA Challenge**: Every device has different hardware. It works on my Pixel 8 (Tensor Chip). Does it work on a 2015
Windows laptop with Intel Integrated Graphics? You need a "Device Farm" for testing.

## Hardware Acceleration (NPU/GPU)

WebNN tries to use the fastest hardware available.

- **NPU (Neural Processing Unit)**: Fast, Low Power. (Ideal).
- **GPU**: Fast, High Power.
- **CPU**: Slow, High Power. (Fallback).

**QA Strategy**: Force different execution providers via flags. Does the result precision match? GPU might return
`0.999999`. CPU might return `1.000001`. Is `Math.abs(diff) < epsilon`?

## Code Snippet: Building a Graph

Constructing a simple computation graph using the WebNN API. Note: This API is very low-level. You usually use a library
like ONNX Runtime Web on top of it.

```javascript
/*
  webnn-test.spec.js
*/
test('should perform matrix multiplication via WebNN', async () => {
  if (!navigator.ml) {
    console.warn('WebNN not supported on this browser');
    return;
  }

  // 1. Create Context (Access Hardware)
  const context = await navigator.ml.createContext();
  const builder = new MLGraphBuilder(context);

  // 2. Define Operands (Tensors)
  // A [2, 2] matrix
  const operandA = builder.input('A', {type: 'float32', dimensions: [2, 2]});
  const operandB = builder.input('B', {type: 'float32', dimensions: [2, 2]});
  
  // 3. Define Operation (A * B)
  const output = builder.matmul(operandA, operandB);
  
  // 4. Compile Graph
  const graph = await builder.build({output});

  // 5. Execute
  const inputs = {
    'A': new Float32Array([1, 2, 3, 4]),
    'B': new Float32Array([1, 0, 0, 1]) // Identity-ish
  };
  const outputs = { 'output': new Float32Array(4) };
  
  await context.compute(graph, inputs, outputs);
  
  // 6. Verify maths
  console.log('Result:', outputs.output);
  // [1*1 + 2*0, 1*0 + 2*1, ...] -> [1, 2, 3, 4]
  expect(outputs.output[0]).toBeCloseTo(1.0);
});
```

## Summary

WebNN optimises the web for the AI era. It turns the browser into a high-performance compute engine.

QA must verify that we do not crash the video driver or overheat the phone. If the phone shuts down due to thermal
throttling, that is a P0 bug.

## Key Takeaways

- **Fallbacks are essential**: If WebNN fails (no NPU), does it fall back to WebASM (WASM) or plain JS? It should. The
  app must not crash.
- **Memory Leaks consume VRAM**: Tensors must be disposed (`tensor.destroy()`) or they crash the tab. Chrome Task
  Manager is your friend.
- **Model Formats need testing**: **ONNX** is the standard. Test importing ONNX models from HuggingFace.

## Next Steps

- **Tool**: Use **TensorFlow.js** with the webnn backend delegate.
- **Learn**: What is a **Tensor**? (It is just a multi-dimensional array, like a nested list of numbers).
- **Audit**: Check thermal throttling. Run inference loops for 10 minutes. Does the device slow down (FPS drop)?
