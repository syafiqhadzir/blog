---
layout: post
title: 'SSR Testing Strategies: The Uncanny Valley of React'
date: 2024-11-14
category: QA
slug: ssr-testing-strategies
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- strategies
- testing
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Hydration: The Frankenstein Moment](#hydration-the-frankenstein-moment)
- [The "Window is undefined" Error](#the-window-is-undefined-error)
- [Code Snippet: Detecting Hydration Errors](#code-snippet-detecting-hydration-errors)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Server-Side Rendering (SSR) is back. We moved from PHP to JS (SPA), and now back to JS-on-Server (Next.js/Nuxt).

It makes sites fast and SEO-friendly. But it introduces a weird state: The user sees the HTML, but the button does not work yet because JS has not loaded.

This is the "Uncanny Valley" of interactivity. Testing SSR means verifying that the Server View and the Client View act as one, not as two strangers meeting for the first time.

## TL;DR

- **Hydration attaches JS to HTML**: The process where JS attaches to the HTML. If content mismatches (e.g., Timestamps), React screams.
- **SEO needs verification**: Verify the initial HTML response (View Source) contains the keywords, not just a generic `<div id="root">`.
- **Environment differs**: Does code run on Node (Server) or Browser (Client)? `window` only exists in one.

## Hydration: The Frankenstein Moment

Server says: "Hello, it is 12:00:00" (rendered at build time).
Client says: "Hello, it is 12:00:05" (rendered at runtime).
React panics. "Text content did not match."

This causes the entire tree to be discarded and re-rendered (destroying the performance gain), or worse, visual glitches.

**QA Strategy**: Watch the Console. Hydration errors are warnings, but they are bugs. Treat them as P1s.

## The "Window is undefined" Error

Classic SSR bug.

Developer writes `if (window.innerWidth > 500) { ... }`. Server tries to run this during the build or request. Server crashes (Node.js has no `window` object).

**QA Strategy**: Test the build pipeline. Test the server logs. If your unit tests rely on `jsdom` (which fakes the window), they will pass, but the Prod build will fail.

## Code Snippet: Detecting Hydration Errors

Cypress or Playwright can listen to console warnings and fail the test if Hydration fails.

```javascript
/*
  ssr.spec.js
*/
const { test, expect } = require('@playwright/test');

test('should have no hydration errors (React)', async ({ page }) => {
  const errors = [];
  
  // Listen for console errors/warnings BEFORE navigating
  page.on('console', msg => {
    const text = msg.text();
    // React's specific hydration error messages
    if (
        text.includes('Hydration failed') || 
        text.includes('Text content does not match') ||
        text.includes('Expected server HTML to contain')
    ) {
      errors.push(text);
    }
  });

  await page.goto('/ssr-page');

  // Wait for JS to take over (Network Idle isn't always enough, but good start)
  await page.waitForLoadState('networkidle');

  if (errors.length > 0) {
    console.error('🚨 Hydration Errors:', errors);
  }
  
  // Strict mode: Fail the test
  expect(errors).toHaveLength(0);
});
```

## Summary

SSR adds complexity for speed. It doubles your testing surface: Server Environment AND Browser Environment.

If you do not test both, you are only testing half the app. And remember: "It works in my browser" means nothing if "It crashes on the Node server".

## Key Takeaways

- **Timezones cause issues**: Server might be UTC. Client might be EST. SSR dates are a nightmare. Standardise on UTC or sanitise dates during hydration.
- **Cookies differ by context**: Server can read `HttpOnly` cookies. Client (JS) cannot. Auth flows differ significantly.
- **Flash of Unstyled Content (FOUC)**: Does CSS load before the HTML? Or does the user see Times New Roman for 0.5s?

## Next Steps

- **Tool**: Disable JavaScript in Chrome DevTools (Command Menu -> Disable JavaScript). Reload. Does the content appear? (It should, for SSR). If it is a blank page, you broke SSR.
- **Learn**: Understand **Static Site Generation (SSG)** vs **Incremental Static Regeneration (ISR)**.
- **Audit**: Check your `robots.txt` and `sitemap.xml`. SSR is for robots (Googlebot), so treat them well.
