---
layout: post
title: 'Visual Regression Testing Mastery: Spotting the 1px Offence'
date: 2023-02-02
category: QA
slug: visual-regression-testing-mastery
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Feature Works, But Looks Like Rubbish" Problem](#the-feature-works-but-looks-like-rubbish-problem)
- [The Flakiness Trap](#the-flakiness-trap)
- [Code Snippet: Taming the Visual Beast](#code-snippet-taming-the-visual-beast)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Functional tests verify logic. They check if `2 + 2 = 4`. Visual regression tests check if the `4` is drawn in Comic Sans or is invisible because it is white text on a white background.

You can have a functional test pass because the "Submit" button exists in the DOM, but if that button is covered by a GDPR banner, your user cannot click it. Visual regression testing is the practice of spotting these unintended CSS crimes before users do.

## TL;DR

- **Context matters**: Functional tests are blind. Visual tests see what the user sees.
- **Golden Images are baselines**: We compare the current state against a "baseline" (Golden) screenshot.
- **Noise is the enemy**: Animations, cursors, and timestamps are your enemies. Kill them.
- **Containers ensure consistency**: Use Docker. Fonts render differently on Mac vs Linux.

## The "Feature Works, But Looks Like Rubbish" Problem

Visual testing tools (like Percy, Applitools, or Playwright) take a screenshot of your app and compare it to a baseline.

If the difference is greater than a set threshold (say, 0.1%), the test fails. This catches:

- **Layout Shifts**: A sidebar pushing content off-screen.
- **Broken CSS**: Styles failing to load.
- **Responsive Issues**: A menu checking out early on mobile screens.

## The Flakiness Trap

The biggest hurdle in visual testing is noise. A test that fails because of a blinking cursor is a test you will eventually delete.

1. **Cursor Blinking**: A blinking cursor creates 100% diffs on that pixel.
2. **Animations**: If a spinner is rotating, every screenshot is unique.
3. **Data**: "Welcome, User #1234" will fail if the baseline was "Welcome, User #1233".

To master this, you must **freeze** the state. Disable animations, mock the data, and use consistent viewports.

## Code Snippet: Taming the Visual Beast

Playwright makes this incredibly easy. Here is a robust setup that handles the "noise" by injecting CSS to kill animations.

```typescript
import { test, expect } from '@playwright/test';

test('Homepage visual check', async ({ page }) => {
  await page.goto('/');
  
  // 1. Force state consistency (The "Sit Still" command)
  // Hide dynamic elements like adverts or rotating carousels
  await page.addStyleTag({ content: `
    .carousel { visibility: hidden !important; }
    * { animation: none !important; transition: none !important; }
    *, *::before, *::after { caret-color: transparent !important; } /* Hide cursors */
  `});

  // 2. Wait for fonts (Crucial! Text flickering is the #1 cause of flakiness)
  await page.evaluate(() => document.fonts.ready);

  // 3. Compare with a threshold
  await expect(page).toHaveScreenshot('home-page.png', {
    maxDiffPixels: 100, // Be forgiving of tiny anti-aliasing diffs
    threshold: 0.2
  });
});
```

This script explicitly kills animations and hides dynamic content before taking the photo. It is like telling the kids to sit still for the family portrait.

## Summary

Visual quality is not 'cosmetic'; it is operational. A broken layout is a broken feature.

If a user cannot see the Checkout button, they cannot pay you. Master the tools that catch what the eyes might miss.

## Key Takeaways

- **Dockerise your tests**: Always run visual tests in Docker. Mac rendering != Linux rendering.
- **Masking hides volatility**: Mask volatile regions (timestamps, random IDs) in your screenshots.
- **Review Workflow needs thought**: If visual diffs are hard to review, no one will check them.

## Next Steps

- **Pick a Page**: Start with your landing page (highest traffic).
- **Snapshot It**: Generate a baseline.
- **Break It**: Intentionally change a font size to 50px and see if the test catches it.
