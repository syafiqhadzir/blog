---
layout: post
title: 'Performance API Testing: Stop Counting Seconds'
date: 2024-12-19
category: QA
slug: performance-api-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- performance
- qa
- testing
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Navigation Timing Level 2](#navigation-timing-level-2)
- [User Timing (Marks \& Measures)](#user-timing-marks--measures)
- [Code Snippet: Real-Time Metric Extraction](#code-snippet-real-time-metric-extraction)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

"The site feels slow."
"How slow?"
"Like, 3 seconds?"

Stop guessing. Stop using a stopwatch on your iPhone. The browser *knows* exactly how slow it is, down to the microsecond.

The `window.performance` API is the flight recorder of the web. QA Engineers should read the black box before filing the bug.

## TL;DR

- **TTFB (Time to First Byte)**: Network latency + Server processing time. (Backend speed).
- **DomInteractive**: When the HTML is parsed and the DOM is ready. Resources (CSS/JS) might still be loading.
- **LoadEventEnd**: When everything (images, scripts, spinners) is done. The "Spinner" stops here.

## Navigation Timing Level 2

It used to be `performance.timing` (Deprecated). Now it is `performance.getEntriesByType('navigation')[0]`. Why? Because specs change and we love breaking changes.

It tells you the breakdown: DNS -> TCP -> SSL -> Request -> Response -> Processing -> Load.

Find the bottleneck. If **DNS** takes 500ms, your code is fine, but your DNS provider is rubbish. If **Response** takes 2s, your SQL query is slow. If **Processing** takes 2s, your JavaScript bundle is too big.

## User Timing (Marks & Measures)

You can inject your own markers into the timeline.

1. `performance.mark('login-start')`
2. `performance.mark('login-end')`
3. `performance.measure('login-duration', 'login-start', 'login-end')`

Now you can track *Custom Business Logic* performance in Production. "How long does the Checkout Process take?" -> Ask the Performance API.

## Code Snippet: Real-Time Metric Extraction

Inject this into your automation to get a JSON report of the page speed. Fail the test if the metrics exceed your Performance Budget.

```javascript
/*
  perf.spec.js
*/
const { test, expect } = require('@playwright/test');

test('should load within performance budget', async ({ page }) => {
  await page.goto('/dashboard');
  
  const metrics = await page.evaluate(() => {
    // Navigation Timing API
    // Ensure we are using JSON.stringify trick to clone the object
    const nav = JSON.parse(JSON.stringify(performance.getEntriesByType('navigation')[0]));
    
    // Paint Timing API (LCP / FCP)
    const paint = performance.getEntriesByType('paint');
    const fcp = paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0;

    return {
      ttfb: nav.responseStart - nav.requestStart,
      domProcessing: nav.domComplete - nav.domInteractive,
      totalLoad: nav.loadEventEnd - nav.startTime,
      fcp: fcp
    };
  });

  console.log('Performance Metrics:', metrics);
  
  // Assertions (Performance Budget)
  expect(metrics.ttfb).toBeLessThan(500); // 500ms Backend Budget
  expect(metrics.totalLoad).toBeLessThan(3000); // 3s Total Load
  expect(metrics.fcp).toBeLessThan(1500); // 1.5s to see something
});
```

## Summary

Performance is a feature.

If your app is slow, people will leave. Amazon found that 100ms latency cost them 1% in sales. If you do not measure it, you cannot improve it. The Performance API is free, built-in, and accurate. Use it.

## Key Takeaways

- **Resource Timing reveals blockers**: `performance.getEntriesByType('resource')`. Tells you which specific JavaScript file blocked the main thread. (Usually `marketing-tracker.js`).
- **Paint Timing shows first render**: `first-contentful-paint` (FCP). When did the user first see *something* other than white space?
- **Long Tasks detect jank**: `PerformanceObserver` can tell you when the Main Thread was frozen for >50ms (Jank).

## Next Steps

- **Tool**: Use **WebPageTest.org**. It uses the Performance API to generate waterfalls. It is the gold standard.
- **Learn**: Read about **Core Web Vitals** (LCP, INP, CLS). Google ranks you based on these metrics, not just "Load Time".
- **Audit**: Add `Server-Timing` headers to your backend responses. The browser can read them via the Performance API! (e.g., `Server-Timing: db;dur=53`)
