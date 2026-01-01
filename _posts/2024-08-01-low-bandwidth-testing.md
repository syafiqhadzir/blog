---
layout: post
title: 'Low-Bandwidth Testing: QA in the Tunnel'
date: 2024-08-01
category: QA
slug: low-bandwidth-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Lie-Fi" Phenomenon](#the-lie-fi-phenomenon)
- [The Spinner of Death](#the-spinner-of-death)
- [Code Snippet: Network Throttling in Tests](#code-snippet-network-throttling-in-tests)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

We build apps on MacBook Pros connected to Gigabit Fibre. Our users use apps on £50 Android phones connected to 3G in an underground tunnel.

The gap between "Dev Reality" and "User Reality" is where performance bugs live. If your app loads a 5MB hero video on the homepage, you are punishing the poor.

QA must be the voice of the user who is watching their data cap evaporate.

## TL;DR

- **Throttling reveals problems**: Test on "Slow 3G". If it takes > 5 seconds to become interactive, you failed.
- **Retries handle failures gracefully**: What happens if a request fails? Do you retry automatically? (Exponential Backoff is your friend).
- **Optimistic UI improves UX**: Show the "Like" instantly, send the request in the background. Do not block the user.

## The "Lie-Fi" Phenomenon

"Lie-Fi" is when your phone says "4 Bars of LTE" but nothing loads. The connection is open, but packets are dropped.

This is worse than being offline. Offline apps can show an "Offline" screen immediately. Lie-Fi apps stare at a white screen until the request times out (usually 60 seconds).

**QA Strategy**: Set your request timeouts to 5-10 seconds. Retry once. Then fail gracefully ("The connection is weak").

## The Spinner of Death

There is nothing users hate more than a spinner that never stops.

If a request takes 10 seconds, show a progress bar. If it takes 1 minute, send an email when it is done. Do not hypnotise the user with a spinning circle.

**QA Check**: Verify that every spinner has a "Cancel" button. Give the user control.

## Code Snippet: Network Throttling in Tests

You can simulate bad networks in Puppeteer/Playwright using the Chrome DevTools Protocol (CDP).

```javascript
/*
  throttling.spec.js
*/
test('should handle Slow 3G gracefully', async ({ page }) => {
  // Connect to CDP session to control network conditions
  const client = await page.context().newCDPSession(page);

  // Emulate "Slow 3G"
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: ((500 * 1024) / 8), // 500 kbps
    uploadThroughput: ((500 * 1024) / 8), // 500 kbps
    latency: 400 // 400ms latency (very painful)
  });

  await page.goto('/heavy-page');

  // Verify that the skeleton loader appears instead of a blank screen
  await expect(page.locator('.skeleton-loader')).toBeVisible();

  // Verify that it eventually loads (allowing for the slow network)
  // Use a higher timeout than normal
  await expect(page.locator('.content')).toBeVisible({ timeout: 15000 });
});
```

## Summary

Performance is inclusion. By optimising for low bandwidth, you welcome more users into your ecosystem.

Do not let your app be an exclusive club for people with fast WiFi. Also, Google ranks fast sites higher. Greed is a good motivator too.

## Key Takeaways

- **Lazy Loading saves data**: Do not load images below the fold until the user scrolls (`loading="lazy"`).
- **Bundles need size limits**: Keep your JS bundle small. 1MB of JS parses much slower than 1MB of JPEG.
- **Feedback builds trust**: If the network is slow, tell the user: "Connection slow... trying to reconnect."

## Next Steps

- **Tool**: Use **Lighthouse** to throttle your network and CPU during audits.
- **Learn**: Read about **Adaptive Bitrate Streaming** (HLS/DASH) for video. It switches quality based on bandwidth.
- **Audit**: Use **WebP** or **AVIF** images. They are vastly smaller than PNG/JPG.
