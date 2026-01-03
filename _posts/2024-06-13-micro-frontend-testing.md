---
layout: post
title: 'Micro-Frontend Testing: Integration Testing Frankenstein''s Monster'
date: 2024-06-13
category: QA
slug: micro-frontend-testing
gpgkey: EBE8 BD81 6838 1BAF
tags: ["frontend", "integration-testing", "microservices", "frontend-testing"]
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "It Works on My Machine" Paradox](#the-it-works-on-my-machine-paradox)
- [Shared Dependency Hell](#shared-dependency-hell)
- [Code Snippet: Testing Cross-MFE Communication](#code-snippet-testing-cross-mfe-communication)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Micro-services solved the backend monolith, but created "distributed headaches". Micro-frontends (MFEs) export that
headache to the browser.

Team A uses React 16. Team B uses React 18. Team C uses jQuery (why?).

QA's job is to ensure the user does not notice they are navigating between three different decades of web development.
It is like stitching together a Frankenstein's monster, but ensuring the arm does not fall off when it waves hello.

## TL;DR

- **Integration reveals composition bugs**: Unit tests are useless if the Shell (Container) crashes. Test the
  composition.
- **Styling must not leak**: Ensure CSS does not leak. If Team A's `button` style breaks Team B's `checkout` form, you
  have failed.
- **Routing breaks first**: Deep linking is the first thing to break. Verify URL persistence across MFE boundaries.

## The "It Works on My Machine" Paradox

Team A deploys their "Cart" MFE (Micro-Frontend) running on `localhost:3001`. It works in isolation. They deploy to
Prod.

The "Shell" app crashes because the Cart MFE exports `default` but the Shell expects `named` exports.

**QA Strategy**: You *cannot* test MFEs in isolation alone. You need a "Canary Shell" environment where the latest
`master` of Shell meets the `branch` of your MFE.

## Shared Dependency Hell

"Let's share React to save bandwidth!"

Team A upgrades to React 19 (Alpha). Team B is still on React 15. The Shell loads React 19 (because it wins the version
resolution war). Team B's code explodes because `componentWillMount` is deprecated.

This is not a bug; it is a crime scene.

QA must audit `package.json` resolutions in the build pipeline. If there are multiple versions of React loaded, your
performance score will tank.

## Code Snippet: Testing Cross-MFE Communication

MFEs usually talk via a global `window` event bus or Custom Events. This is hard to unit test, so e2e is your friend.

```javascript
/*
  mfe-integration.spec.js
  Scenario: Product MFE adds item -> Header MFE updates count
*/
const { test, expect } = require('@playwright/test');

test('Cart MFE should update Header MFE', async ({ page }) => {
  await page.goto('/product/123');

  // 1. Interaction in "Product" MFE
  // Note: MFEs might be in Shadow DOM or Iframes, use locators wisely
  const addToCartBtn = page.locator('mfe-product .add-to-cart-btn');
  await addToCartBtn.waitFor();
  await addToCartBtn.click();

  // 2. Verification in "Header" MFE
  // The header is a completely separate application
  const cartBadge = page.locator('mfe-header .cart-badge');
  
  // Verify the count incremented
  // This proves the Event Bus actually worked
  await expect(cartBadge).toHaveText('1');

  // 3. Debugging: Listen for the event manually if the UI fails
  const eventData = await page.evaluate(() => {
    return new Promise(resolve => {
        // Timeout if event doesn't fire in 2s
        setTimeout(() => resolve(null), 2000);
        window.addEventListener('cart:update', (e) => resolve(e.detail), { once: true });
    });
  });
  
  if (!eventData) console.log("⚠️ Event bus message missed!");
});
```

## Summary

Micro-frontends are great for organisational scaling (Conway's Law), but terrible for consistency. Your test suite is
the glue that holds the monster together.

If the glue fails, the monster eats the user. Ideally, avoid MFEs unless you have >50 frontend developers.

## Key Takeaways

- **Performance needs monitoring**: Monitor the network tab. Are you loading `lodash` 5 times? If so, your Webpack
  Module Federation config is wrong.
- **Error Boundaries are mandatory**: If the "Ads" MFE crashes, the main content should still be visible. React Error
  Boundaries are mandatory.
- **Versioning enables independent rollbacks**: Can you rollback *just* the Header without rolling back the Footer? If
  not, you do not have Micro-frontends; you have a Monolith with extra steps.

## Next Steps

- **Tool**: Use **Module Federation Dashboard** to visualise dependency graphs.
- **Learn**: Study **Single-SPA** lifecycle methods (bootstrap, mount, unmount).
- **Audit**: Check CSS isolation. Append random suffixes to classes (CSS Modules) to prevent leakage.
