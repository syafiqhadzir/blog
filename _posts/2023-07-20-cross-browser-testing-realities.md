---
layout: post
title: "Cross-Browser Testing Realities: Safari is the New IE"
date: 2023-07-20
category: QA
slug: cross-browser-testing-realities
gpgkey: "EBE8 BD81 6838 1BAF"
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Three Engines Problem](#the-three-engines-problem)
- [The Safari Tax](#the-safari-tax)
- [Code Snippet: The Playwright Matrix](#code-snippet-the-playwright-matrix)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

In the mid-2000s, web development had one enemy: **Internet Explorer 6**. We spent 50% of our time debugging why `z-index` was not working and why `png` transparency looked like a grey box.

Today, Chrome has won. It is the new Standard. But we still have an enemy. It is installed on every iPhone, it refuses to implement standard APIs, and it updates only when the OS updates. **Safari** is the new IE.

Cross-browser testing is not about testing 500 versions of Chrome. It is about testing the **Three Engines** that run the web.

## TL;DR

- **Engines over Browsers**: Test **Blink** (Chrome/Edge), **Gecko** (Firefox), and **WebKit** (Safari).
- **Mobile First applies here**: Safari on iOS is the most restrictive environment in the world. Test it first.
- **Automation speeds testing**: Use Playwright to run tests in parallel across all engines. Selenium is too slow for this.

## The Three Engines Problem

You do not need to test Chrome, Edge, Brave, and Opera separately. They are all **Chromium** (Blink engine) under the hood. If it works in Chrome, it works in Edge.

You need to test:

1. **Blink**: The standard. Low risk.
2. **Gecko (Firefox)**: The rebel. Good standards support, but distinct rendering.
3. **WebKit (Safari)**: The headache. Strict privacy policies (ITP), weird date parsing, and flexbox bugs.

## The Safari Tax

If a bug is reported "only on iPhone", it is usually WebKit.

Common issues:

- **RegEx**: Safari refused to support 'Lookbehind' syntax for years.
- **Dates**: `new Date('2023-01-01')` works in Chrome. In older Safari, it returns `Invalid Date` because it hates hyphens.
- **100vh**: The "viewport height" changes when the address bar scrolls away, making your footer dance.

Testing on Localhost is not enough. You need to run your suite against a real WebKit instance.

## Code Snippet: The Playwright Matrix

Playwright is superior to Selenium because it bundles the actual browser binaries. Here is a config to run your suite across the Big Three.

```typescript
// playwright.config.ts
import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  projects: [
    {
      name: 'Chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'WebKit',
      use: { ...devices['Desktop Safari'] },
    },
    /* The Ultimate Stress Test */
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
};
export default config;
```

Run it with `npx playwright test`. If you see 3 green dots and 1 red dot, guess which browser failed? (Hint: It is the one made by a fruit company).

## Summary

Cross-browser testing is no longer about supporting outdated rubbish. It is about ensuring your React app works on the £1,000 phone your CEO is holding.

Do not rely on "It works on my machine". Your machine is likely a MacBook Pro running Chrome. Your user is on a dusty iPad running Safari 14.

## Key Takeaways

- **Do not Over-Test**: Chrome and Edge are twins. Test one.
- **Date Handling needs libraries**: Use a library like `date-fns` or `dayjs`; never parse date strings manually if you want Safari support.
- **Scroll Chains differ**: Test scrolling on mobile; "passive events" behave differently on iOS.

## Next Steps

- **Install**: Add Playwright to your repo (`npm init playwright@latest`).
- **Audit**: Check your CSS grid/flexbox on an iPhone.
- **Polyfill**: Ensure your `babel` or `vite` config targets `safari14` to prevent syntax errors.
