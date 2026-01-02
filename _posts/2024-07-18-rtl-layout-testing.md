---
layout: post
title: 'RTL Layout Testing: Flipping the World Upside Down (Sideways)'
date: 2024-07-18
category: QA
slug: rtl-layout-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Mirror" Effect](#the-mirror-effect)
- [Icons: To Flip or Not to Flip?](#icons-to-flip-or-not-to-flip)
- [Code Snippet: Detecting Directionality](#code-snippet-detecting-directionality)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Arabic, Hebrew, Persian, and Urdu are read Right-to-Left (RTL). Most developers build Left-to-Right (LTR) and assume
ticking a box in CSS fixes it.

It does not.

Testing RTL is like learning to drive in the UK. Everything is backwards, and you will crash into a roundabout. QA's job
is to ensure the "Back" button points backwards relative to the language, not the screen (which implies "Forward" in
LTR).

## TL;DR

- **Alignment reverses**: Text should align right. Bullet points should be on the right.
- **Scroll switches sides**: The scrollbar should be on the left (usually).
- **Navigation inverts**: The "Next" arrow should point Left. (Yes, really).

## The "Mirror" Effect

When `dir="rtl"` is applied:

- `margin-left` becomes `margin-right`.
- `padding-left` becomes `padding-right`.
- `float: left` becomes `float: right`.
- Flexbox `flex-start` starts from the Right.

If you used hardcoded `left: 10px` or `offset-x: 5px`, your UI is broken.

**QA Strategy**: Use a "CSS Mirror" tool logic or just create a test user with "Arabic" as the language.

## Icons: To Flip or Not to Flip?

This is where it gets tricky.

- **Flip**: Back arrow, Forward arrow, Progress bar, Bicycle (it should ride into the content), "Speech Bubble" (tail
  needs to flip).
- **Do not Flip**: Clock hands, Checkmarks, Brand logos (Coca-Cola is always Coca-Cola), Video playback controls (Play
  is always Play).

**QA Strategy**: Check every icon. If the "Play" button points backwards, your media player looks effectively broken.

## Code Snippet: Detecting Directionality

You can use `window.getComputedStyle` to verify the browser is actually respecting the RTL attribute.

```javascript
/*
  rtl.spec.js
*/
test('should apply RTL direction to the body', async ({ page }) => {
  // 1. Force RTL mode (e.g., via query param or setting)
  await page.goto('/?lang=ar');

  // 2. Verify the document has the correct direction
  const direction = await page.evaluate(() => {
    return window.getComputedStyle(document.body).direction;
  });

  expect(direction).toBe('rtl');

  // 3. Verify specific element alignment
  // In RTL, the "start" of a flex container is on the right.
  const header = page.locator('.header');
  
  // Logic check: Is the logo on the Right?
  // We can check x-coordinates.
  const logoBox = await header.locator('.logo').boundingBox();
  const screenWidth = page.viewportSize().width;
  
  // In LTR, x is near 0. In RTL, x is near screenWidth.
  expect(logoBox.x).toBeGreaterThan(screenWidth / 2);
});
```

## Summary

RTL testing is mind-bending. It exposes every hardcoded "Left" and "Right" in your CSS. It forces you to think in
"Start" and "End" (Logical Properties).

Your app is not global until it works sideways.

## Key Takeaways

- **Input Fields need care**: In RTL, the cursor starts on the right. Phone numbers (`+1 555...`) are tricky because
  numbers are often still LTR even in RTL text (Bidirectional text).
- **Logical Properties are the solution**: Tell your devs to use `margin-inline-start` instead of `margin-left` to
  support both modes automatically.
- **Carousels must reverse**: Does the carousel swipe right to go next? It should.

## Next Steps

- **Tool**: Use **RTLCSS** to automatically flip your stylesheets if you are not using logical properties yet.
- **Learn**: Read the **W3C Internationalisation** guidelines on Bi-directional text (bidi).
- **Audit**: Check your breadcrumbs. `Home > Category > Item` should flow Right to Left (`Item < Category < Home`).
