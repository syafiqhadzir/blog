---
layout: post
title: "Dynamic Image Optimisation Testing: Pixels are Heavy"
date: 2024-12-12
category: QA
slug: dynamic-image-optimisation-testing
gpgkey: "EBE8 BD81 6838 1BAF"
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The CLS (Cumulative Layout Shift) Killer](#the-cls-cumulative-layout-shift-killer)
- [AVIF vs WebP](#avif-vs-webp)
- [Code Snippet: Verifying Image Formats](#code-snippet-verifying-image-formats)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Images account for 60% of web content weight.

A single unoptimised Hero Image can destroy your Lighthouse score and your user's data plan. Modern stacks (Next.js Image, Nuxt Image, Cloudinary) optimise images on the fly. But they can also fail silently.

"Why is the company logo requested as a 5MB PNG but served as a blurry 2KB WebP?" "Because the optimiser decided 1% quality is efficient. Technically, it is efficient. Visually, it is rubbish."

## TL;DR

- **Format matters**: Are you serving AVIF to modern Chrome/Firefox and JPEG to old Safari? (Content Negotiation).
- **Size must match viewport**: Are you serving a 4000px wide image to a 320px mobile screen? (Bandwidth theft).
- **Lazy loading has rules**: Images below the fold MUST be lazy-loaded. Images above the fold (Hero) MUST NOT be lazy-loaded (LCP penalty).

## The CLS (Cumulative Layout Shift) Killer

Image loads. Height is unknown. Height snaps to 400px. Text moves down. User clicks the wrong button (usually "Delete" instead of "Save"). Rage.

**QA Strategy**: Ensure every `<img>` tag has explicit `width` and `height` attributes (aspect ratio reservation), or CSS `aspect-ratio` property. Test on a throttled "Slow 3G" connection to see the jump.

## AVIF vs WebP

**JPEG**: The dinosaur. Good compatibility. Bad compression.
**WebP**: The standard. 30% smaller than JPEG. Google loves it.
**AVIF**: The shiny new toy. 50% smaller than JPEG. Support is growing.

Test that your CDN sends the correct `Content-Type` header based on the `Accept` header request. If I send `Accept: image/avif`, send me AVIF. If I do not, send me JPEG.

## Code Snippet: Verifying Image Formats

Playwright can intercept the request and check the response format headers. Note: File extension in URL (`.jpg`) often lies. The Header `content-type` is the truth.

```javascript
/*
  images.spec.js
*/
const { test, expect } = require('@playwright/test');

test('should serve AVIF to supported browsers', async ({ page }) => {
  // 1. Set up interception for the Hero image
  const imageResponsePromise = page.waitForResponse(resp => 
    resp.url().includes('hero-banner') && resp.status() === 200
  );

  await page.goto('/home');
  const response = await imageResponsePromise;
  
  // 2. Check the Content-Type header
  const headers = response.headers();
  const contentType = headers['content-type'] || headers['Content-Type'];
  
  console.log(`Served Format: ${contentType}`);
  
  // 3. Since Playwright (Chromium) supports AVIF, we expect optimal format
  // If your CDN is working, it should NOT be image/jpeg
  expect(contentType).toMatch(/image\/(avif|webp)/);
  
  // 4. Check size
  const size = await response.body().then(b => b.length);
  console.log(`Image Size: ${size} bytes`);
  expect(size).toBeLessThan(50 * 1024); // Should be < 50KB
});
```

## Summary

Optimising images is the highest ROI performance fix. Testing it is tricky because it is visual.

Use automation to check the headers (invisible metadata), and your eyes to check the artefacts (visible blurriness). And please, stop using PNGs for photos.

## Key Takeaways

- **LCP needs priority**: The Hero image is usually the LCP element. Add `rel="preload"` or `priority="high"` to it.
- **Blur-up transitions matter**: Does the low-res placeholder fade smoothly into the high-res? Or does it glitch?
- **Metadata stripping has tradeoffs**: Did the optimisation strip the EXIF data? (Good for privacy/size, bad if you needed the GPS location for a map feature).

## Next Steps

- **Tool**: Use **Cloudinary Analysers** or **Squoosh.app** to manually inspect compression.
- **Learn**: Read about the **`<picture>`** element and `srcset`. Understanding `1x`, `2x` (Retina) pixel density is crucial.
- **Audit**: Run a Lighthouse audit. If "Properly size images" is red, you have work to do.
