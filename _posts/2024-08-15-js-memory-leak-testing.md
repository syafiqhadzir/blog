---
layout: post
title: 'JavaScript Memory Leak Testing: The RAM Vampire'
date: 2024-08-15
category: QA
slug: js-memory-leak-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Detached Node" Horror](#the-detached-node-horror)
- [Closures: The Silent Trap](#closures-the-silent-trap)
- [Code Snippet: Automating Heap Snapshots](#code-snippet-automating-heap-snapshots)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

JavaScript has a Garbage Collector (GC). Developers think this means they do not have to manage memory. They are wrong.

If you attach an event listener to a button and remove the button from the DOM but forget to remove the listener... the button lives forever in RAM. It waits. It hungers.

Eventually, your Single Page App (SPA) consumes 4GB of RAM and crashes the tab with an "Aw, Snap!" error.

## TL;DR

- **Baseline comparison reveals leaks**: Check memory usage. Do action. Check memory usage. It should return close to baseline.
- **Sawtooth pattern is healthy**: A healthy graph goes up (allocation) and down (GC). A bad graph looks like a staircase to hell (Allocation without Deallocation).
- **Detached DOM stays forever**: Elements that are no longer on screen but still referenced by JS cannot be deleted.

## The "Detached Node" Horror

You create a modal. User closes modal. You `modal.remove()`.

But your global `const allModals = []` array still holds a reference to it. The DOM node is "Detached". It is not in the tree, but it cannot be deleted.

Even worse: If that node has children, the *entire tree* is kept in memory. One detached `div` can hold onto 10,000 other elements.

**QA Test**: Open/Close the modal 1,000 times. Does the memory grow linearly?

## Closures: The Silent Trap

JS Closures are powerful. They "close over" variables.

If a big object is captured in a closure that is widely used, that big object stays in memory.

**QA Strategy**: Use the "Allocation Instrumentation on Timeline" in Chrome DevTools to see who is holding onto the memory.

## Code Snippet: Automating Heap Snapshots

You can use Puppeteer to take heap snapshots and analyse them. Note: You must start Chrome with `--js-flags="--expose-gc"` to force Garbage Collection programmatically.

```javascript
/*
  memory-leak.spec.js
*/
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--js-flags="--expose-gc"'] // Crucial for testing
  });
  const page = await browser.newPage();
  
  // 1. Establish Baseline
  await page.goto('https://myapp.com');
  await page.evaluate(() => window.gc()); // Force clean
  const initialMetrics = await page.metrics();
  const initialHeap = initialMetrics.JSHeapUsedSize;

  console.log(`Initial Heap: ${initialHeap / 1024 / 1024} MB`);

  // 2. Perform Action (The "Stress Test")
  for (let i = 0; i < 50; i++) {
    await page.click('#open-modal');
    await page.waitForSelector('.modal');
    await page.click('#close-modal');
    await page.waitForSelector('.modal', { state: 'hidden' });
  }

  // 3. Final Measurement
  await page.evaluate(() => window.gc()); // Force clean again
  const finalMetrics = await page.metrics();
  const finalHeap = finalMetrics.JSHeapUsedSize;
  
  console.log(`Final Heap: ${finalHeap / 1024 / 1024} MB`);

  const growth = finalHeap - initialHeap;
  if (growth > 1024 * 1024) { // 1MB tolerance
    console.error(`🚨 MEMORY LEAK DETECTED: +${growth / 1024} KB`);
    process.exit(1);
  } else {
    console.log("✅ Memory is stable.");
  }
  
  await browser.close();
})();
```

## Summary

Memory leaks are slow killers. They do not crash the app in testing. They crash the app after the user has been using it for 4 hours.

Be the QA who leaves the app running overnight to see if it survives.

## Key Takeaways

- **Single Page Apps are prone to leaks**: These are prone to leaks because the page never refreshes (which is the only true way to clear memory).
- **Listeners must be cleaned up**: Always `removeEventListener` in your component cleanup (e.g., React `useEffect` return).
- **Console retains references**: Keeping large objects in `console.log(hugeObj)` prevents them from being garbage collected (if DevTools is open).

## Next Steps

- **Tool**: Use **MemLab** (by Meta) to automatically find leaks. It is tailored for React apps.
- **Learn**: Read about **WeakMap** and **WeakRef**. They hold references without preventing GC.
- **Audit**: Check your third-party ads. They are notorious for leaking memory because they create iframes and never destroy them.
