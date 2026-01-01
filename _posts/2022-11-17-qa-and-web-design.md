---
layout: post
title: 'QA and Web Design: Why Ugly Software is a Bug'
date: 2022-11-17
category: QA
slug: qa-and-web-design
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Not My Job" Fallacy](#the-not-my-job-fallacy)
- [The Visual QA Guide](#the-visual-qa-guide)
- [Collaboration: Don't Be a Cop](#collaboration-dont-be-a-cop)
- [Code Snippet: Visual Regression Testing](#code-snippet-visual-regression-testing)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Bad design is like staring directly into the sun: impactful, sure, but mostly just painful.

As QA engineers, we often focus on "does it work?" (Functionality) and forget "does it look like a ransom note?" (Aesthetics). But here is the truth: to a user, a button that is misaligned by 50 pixels is just as broken as a button that throws a 500 error. We are the final line of defence against pixel-imperfect layouts and Comic Sans slipping into production.

## TL;DR

- **Looks Matter**: A broken layout destroys trust faster than a slow API.
- **You Are the Bridge**: Connect the Figma dream to the CSS reality.
- **Automate the Eyeballs**: Human eyes get tired; snapshot tests do not.
- **Accessibility is QA**: If it is not accessible, it is not "done".

## The "Not My Job" Fallacy

"I am a functional tester," you say. "I do not care about colours."

Wrong. You are a *Quality* Assurance engineer. Visuals are part of quality. If the deliverable looks like it was assembled in the dark by a raccoon, the quality is low. A button that works but is invisible (white text on a white background) is functionally correct but practically useless.

## The Visual QA Guide

Do not just look; *inspect*.

1. **Typography**: Is that *Roboto* or *Arial*? If you cannot tell, use the DevTools.
2. **Spacing**: Padding and margins should be consistent. If one button has 10px padding and the next has 12px, fix it. "Magic numbers" are for magicians, not CSS.
3. **Responsiveness**: Resize the browser. Drag it from "Desktop" to "Mobile". Does the layout scream in agony?
4. **States**: Hover, Focus, Active, Disabled. Does the button do something when you touch it, or is it playing dead?

## Collaboration: Don't Be a Cop

Designers need to treat QA as their best friends. We are the ones who ensure their vision survived the developer's brutal CSS refactor.

When you find a visual bug, do not just say "It's ugly." Say, "The padding on the primary button is 8px, but the design system specifies 12px." Be precise. Designers love precision.

## Code Snippet: Visual Regression Testing

Human eyes are great at spotting a tiger in the bushes, but terrible at spotting a 1px border change. Algorithms are the opposite. Here is how you can use Playwright to automate your visual checks:

```typescript
import { test, expect } from '@playwright/test';

test('Homepage Visual Regression Check', async ({ page }) => {
  await page.goto('https://staging.example.com');
  
  // Wait for fonts to load to avoid "flaky" diffs
  await page.evaluate(() => document.fonts.ready);
  
  // Take a snapshot and compare with the baseline
  // If this is the first run, it creates the baseline.
  // If pixels differ by more than the threshold, it fails.
  await expect(page).toHaveScreenshot('homepage-desktop.png', {
    maxDiffPixels: 100, // Be kind, rendering engines vary.
    threshold: 0.2
  });
});
```

This test is ruthless. It will fail if a developer changes the `font-size` by 1px. But that is what we want. We want to know *everything*.

## Summary

QA testers should never be satisfied with "good enough" solutions. A misalignment of 2px might seem trivial to a backend dev, but it screams "we do not care" to the user.

Always remember: the Q stands for Quality, not "Quite okay".

## Key Takeaways

- **Pixel Perfect**: Aim for it. Settle for "Pixel Distinct".
- **Tools**: Use Percy, Applitools, or Playwright. Do not rely on tired eyes.
- **Accessibility**: Check contrast ratios. Use a screen reader.
- **Collaboration**: Sit with the designer *during* the build, not just after.

## Next Steps

- **Install**: Try out Playwright's `toHaveScreenshot` today.
- **Inspect**: Open DevTools on your product. Audit the margins. Are they consistent?
- **Talk**: Ask a designer to walk you through their Figma file. Ask them what "grid system" they use.
