---
layout: post
title: 'Service Worker Caching Testing: How to Break Your Site for 50% of Users'
date: 2024-04-25
category: QA
slug: service-worker-caching-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Stale" Nightmare](#the-stale-nightmare)
- [The "Offline" Lie](#the-offline-lie)
- [Code Snippet: Validating Caching with Playwright](#code-snippet-validating-caching-with-playwright)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

There are two hard problems in computer science: naming things, cache invalidation, and off-by-one errors.

Service Workers put cache invalidation directly into your hands. What could go wrong? Everything.

If you mess this up, your user will see the Christmas banner in July. Or worse, they will be running JavaScript from last year that is trying to call an API endpoint you deleted yesterday.

## TL;DR

- **Strategy matters**: Know the difference between `Cache-First` (Images), `Network-First` (API), and `Stale-While-Revalidate` (Avatars).
- **Versioning is mandatory**: Every time you deploy, you *must* increment the cache version, or the new code will never load.
- **Bypass must work**: Can you force a reload using `Shift+F5`? If not, you have built a prison, not a PWA.

## The "Stale" Nightmare

`Stale-While-Revalidate` is the darling of the PWA world.

1. Show the cached (old) version instantly.
2. Fetch the new version in the background.
3. Update the cache for *next time*.

The problem: The user sees old data *this time*.

**QA Scenario**: User changes password -> Navigates to Profile -> Still sees "Password Strength: Weak". User panics. Support ticket filed.

You need UX that says: "New content available. Click to refresh."

## The "Offline" Lie

Your app says "Offline Ready". But when I go offline, the app tries to load a font from Google Fonts. The font fails. The text is invisible.

**QA Rule**: If it is not in the cache, it does not exist offline. You cannot rely on *any* external CDNs for an offline-first app unless you explicitly cache those opaque responses.

## Code Snippet: Validating Caching with Playwright

We can intercept network requests in Playwright to verify if they are coming from the Service Worker (disk cache) or the Network.

```javascript
/*
  cache.spec.js
*/
const { test, expect } = require('@playwright/test');

test('should serve images from cache on second visit', async ({ page }) => {
  // 1. First Visit (Prime the cache)
  await page.goto('/gallery');
  // Wait for the Service Worker to do its thing (network idle helps)
  await page.waitForLoadState('networkidle');

  // 2. Second Visit (Offline)
  await page.context().setOffline(true);
  
  // Reloading usually bypasses SW in some browsers, so we navigate
  await page.goto('/gallery');

  const image = page.locator('img#logo');
  
  // If this passes, the image was served from cache
  await expect(image).toBeVisible();

  // 3. Optional: Inspect the response manually
  /*
  page.on('response', resp => {
      console.log(resp.fromServiceWorker()); // Should be true
  });
  */
});
```

## Summary

Service Workers are powerful. But with great power comes the ability to destroy your user experience.

Test your cache strategies in the worst conditions (Slow 3G, Offline, Lie-Fi). Do not let your app become a digital fossil.

## Key Takeaways

- **Storage Quota needs handling**: Browsers will delete your cache if the disk is full. Handle `QuotaExceededError`.
- **Scope limits control**: A Service Worker at `/blog/sw.js` cannot control `/login`. Location matters.
- **Opaque Responses are dangerous**: Caching requests to other domains (CORS) is tricky. You might be caching a 404 (opaque response) and serving it forever.

## Next Steps

- **Tool**: Use **Workbox** recipes. Do not write raw SW logic unless you are a masochist.
- **Learn**: Understand the **Service Worker Lifecycle** (Install -> Activate -> Fetch).
- **Audit**: Clear your browser data and verify the "First Load" experience. Is it fast?
