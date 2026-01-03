---
layout: post
title: 'Web Vitals Testing: Why Google Hates Your Website'
date: 2024-05-02
category: QA
slug: web-vitals-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:
- performance
- strategies
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [LCP: The "Is Anything Happening?" Metric](#lcp-the-is-anything-happening-metric)
- [CLS: The "Stop Moving the Button" Metric](#cls-the-stop-moving-the-button-metric)
- [Code Snippet: Measuring Vitals in QA](#code-snippet-measuring-vitals-in-qa)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Google's Core Web Vitals (CWV) are not just "nice to have". If you fail them, Google buries your site on Page 10 of the
search results, right next to the conspiracy theories and Myspace profiles.

QA determines if a new feature is "functional". CWV determines if it is "usable". A feature that works but takes 10
seconds to load is not a feature; it is a bug.

## TL;DR

- **LCP (Largest Contentful Paint)**: If the main image takes > 2.5s to load, you fail.
- **INP (Interaction to Next Paint)**: Identify laggy clicks (replaced FID in 2024).
- **CLS (Cumulative Layout Shift)**: If the text moves whilst I am reading it, I rage-quit.

## LCP: The "Is Anything Happening?" Metric

LCP measures when the "main thing" is on the screen. Developers love giant 4K hero images.

QA's job is to ask: "Does this 5MB PNG file spark joy, or just latency?"

Test on **Slow 3G**. If you cannot brew a coffee before it loads, it is too slow.

**Optimisation tip**: If the hero image is lazy-loaded, you are doing it wrong. Proper LCP images should be eager-
loaded.

## CLS: The "Stop Moving the Button" Metric

You go to click "Cancel". An ad loads. The layout shifts down. You click "Buy Now" instead.

That is CLS. It is the most annoying pattern on the web.

**QA Scenario**: Verify that images have explicit `width` and `height` attributes to reserve space. If you inject a
banner dynamically, make sure you reserve the pixels for it first.

## Code Snippet: Measuring Vitals in QA

You can inject a script to capture vitals during your automated tests.

```javascript
// Monitor Core Web Vitals and log them
// Ideally, use the 'web-vitals' library from npm
import { onLCP, onINP, onCLS } from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify(metric);
  console.log(`[Vital] ${metric.name}: ${metric.value}`);
  
  /* 
     In a real app, send to an analytics endpoint:
     navigator.sendBeacon('/analytics', body);
     
     QA Tip: In your E2E test, intercept this network request
     and assert that metric.value < threshold.
  */
}

// Ensure this runs in your test environment
onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);

console.log("Web Vitals Monitoring Active.");
```

## Summary

Performance is not an "engineering concern". It is a "business survival concern".

QA is the guardian of the Vitals. If you let a regression slip, traffic drops, revenue drops, and everyone gets sad.

## Key Takeaways

- **Fonts cause layout shifts**: Web fonts cause layout shifts (FOUT/FOIT). Preload them or use `font-display: swap`.
- **Third-Party Scripts slow LCP**: Chat widgets and tracking pixels are the #1 cause of slow LCP.
- **SPA Navigation needs monitoring**: Vitals are tricky in Single Page Apps (Soft Navigations). Ensure you monitor
  route changes, not just the initial load.

## Next Steps

- **Tool**: Use the **Web Vitals Extension** for Chrome.
- **Learn**: Read exactly how **Lighthouse** scores are calculated (it changes every year).
- **Audit**: Check your production logs. Real User Monitoring (RUM) is more honest than lab tests.
