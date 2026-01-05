---
layout: post
title: "Battery Drain Testing: Don't Burn My Thigh"
date: 2024-08-08
category: QA
slug: battery-drain-testing
gpgkey: EBE8 BD81 6838 1BAF
tags: ['artificial-intelligence', 'performance', 'hardware-testing']
description:
  'Users hate apps that drain battery. If your users'' phone gets hot enough to
  fry an egg whilst browsing your "About Us" page, you have a problem.'
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Pocket Warmer" Effect](#the-pocket-warmer-effect)
- [Animations: The Silent Killer](#animations-the-silent-killer)
- [Code Snippet: Politeness (Visibility API)](#code-snippet-politeness-visibility-api)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Users hate apps that drain battery. If your users' phone gets hot enough to fry
an egg whilst browsing your "About Us" page, you have a problem.

QA usually tests on plugged-in desktops. Ideally, you should test on an old
Android phone with 12% battery left. If your app kills the last 12% in 5
minutes, uninstall is imminent.

## TL;DR

- **CPU Usage drains battery**: High CPU = High Battery drain. Keep usage low
  when idle (ideally 0%).
- **Radio activity costs power**: Constant network requests keep the cellular
  modem active (high drain). Batch requests together.
- **Dark Mode saves OLED power**: OLED screens save battery on black pixels.
  Test that your Dark Mode is actually black (`#000000`), not just dark grey.

## The "Pocket Warmer" Effect

Infinite loops in JavaScript do not just freeze the UI; they max out a CPU core.
On a mobile device, this generates heat.

Thermal throttling kicks in. The phone slows down. The user blames the phone,
but the fault is your `while(true)` loop.

**QA Strategy**: Use Chrome DevTools "Performance Monitor". If CPU is > 20%
whilst doing nothing, flag it.

## Animations: The Silent Killer

CSS Animations are great. But if you animate `margin-left` instead of
`transform`, the browser has to re-calculate layout on every frame (Reflow).
This is expensive.

The GPU is efficient, but keeping it awake costs power. Stop animations when
they are off-screen. If you have a spinning logo that is hidden behind a modal,
stop spinning it.

## Code Snippet: Politeness (Visibility API)

Your app should go to sleep when the user switches tabs. Stop polling. Stop
animations. Stop mining crypto (just kidding... mostly).

```javascript
/*
  politeness.spec.js
*/
const { test, expect } = require('@playwright/test');

test('should stop polling when tab is hidden', async ({ page }) => {
  await page.goto('/dashboard');

  // Check initial state (Polling active)
  let requestCount = 0;
  // Listen for background API calls
  page.on('request', (req) => {
    if (req.url().includes('/api/status')) requestCount++;
  });

  // Wait 2s and measure baseline
  await page.waitForTimeout(2000);
  const baseline = requestCount;
  console.log(`Baseline requests: ${baseline}`);

  // Simulate tab switch (Visibility Hidden)
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      writable: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });

  // Reset counter
  requestCount = 0;
  await page.waitForTimeout(2000);
  console.log(`Hidden requests: ${requestCount}`);

  // Expect drastic reduction in requests (ideally 0)
  expect(requestCount).toBeLessThan(baseline / 2);
});
```

## Summary

Battery testing is about empathy. Your user might be lost in a forest with 5%
battery, trying to load your map.

Do not be the reason their phone dies. Energy efficiency is also a form of Green
coding. Save the planet, one CPU cycle at a time.

## Key Takeaways

- **Timers run in background**: `setInterval` runs even in background tabs
  (though browsers throttle it to 1Hz). Use `requestAnimationFrame` for
  visuals—it pauses automatically when hidden.
- **GPS drains quickly**: Constant Geolocation updates drain battery fast. Do
  you need high accuracy (`enableHighAccuracy: true`)? Probably not.
- **Video is expensive**: Autoplaying video is a battery hog. Do not do it
  unless requested.

## Next Steps

- **Tool**: Use **Android Studio Profiler** to see the energetic impact of your
  WebView.
- **Learn**: Understand **Wake Locks**. Sometimes you _need_ to keep the screen
  on (e.g., Recipe app), but use it wisely.
- **Audit**: Check your `third-party-scripts`. Ad networks are notorious for
  burning CPU to track visibility.
