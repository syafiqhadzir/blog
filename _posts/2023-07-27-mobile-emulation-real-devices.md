---
layout: post
title: "Mobile Emulation vs Real Devices: The Great Lie"
date: 2023-07-27
category: QA
slug: mobile-emulation-real-devices
gpgkey: "EBE8 BD81 6838 1BAF"
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Lie of Device Mode](#the-lie-of-device-mode)
- [The Thumb Factor](#the-thumb-factor)
- [Code Snippet: Enabling Touch Events](#code-snippet-enabling-touch-events)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Chrome DevTools has a magical button. You click it, and your desktop browser shrinks. It looks like an iPhone. It says "iPhone 12". It acts like an iPhone.

But it is lying to you.

It is still running on your Intel i9 processor with 32GB of RAM and a wired Gigabit Ethernet connection. It is not an iPhone. It is a Ferrari wearing a bicycle costume.

## TL;DR

- **Emulators are for CSS debugging**: Great for CSS layout debugging. Terrible for performance testing.
- **Simulators are faster than reality**: (iOS/Android Studio) Run the mobile OS on your desktop. Better, but still too fast.
- **Real Devices reveal truth**: The only way to feel the pain of a 3G network and a cheap battery.

## The Lie of Device Mode

Browser "Emulation" primarily changes two things:

1. **Viewport Size**: It resizes the window.
2. **User Agent (UA)**: It pretends to be mobile so the server sends mobile HTML.

It does **not** emulate:

- **CPU**: Your phone is slow. Your laptop is fast. JS that executes instantly on your laptop might freeze a phone for 3 seconds.
- **Thermal Throttling**: Phones get hot. When they get hot, they slow down. Chrome DevTools never gets hot.
- **Network Flakiness**: "Slow 3G" throttling is a consistent slow stream. Real 3G is a series of disconnects and packet loss.

## The Thumb Factor

A mouse pointer has pixel-perfect precision. A thumb is a fat sausage.

Features that work great with a mouse (like tiny hover menus) are unusable on touch screens.

Furthermore, "Hover" logic typically breaks on mobile. On iOS, clicking once usually triggers the "hover" state, and clicking twice triggers the "click". This double-tap requirement kills conversion rates faster than a 404 error.

## Code Snippet: Enabling Touch Events

When automating mobile tests with Playwright, simply setting the `viewport` is not enough. You must enable `hasTouch` to force the browser to emit `touchstart` events instead of `click` events.

```typescript
import { test, devices, expect } from '@playwright/test';

// Configuration for a true mobile experience simulation
const pixel5 = devices['Pixel 5'];

test.use({
  ...pixel5,
  // These flags are crucial for realism:
  hasTouch: true,
  isMobile: true,
  javaScriptEnabled: true,
  // Fake the GPS to Paris
  geolocation: { longitude: 48.858455, latitude: 2.294474 }, 
  permissions: ['geolocation'],
});

test('mobile navigation menu works with touch', async ({ page }) => {
  await page.goto('https://my-app.com');
  
  // On mobile, the menu is often hidden behind a hamburger icon
  // "Tap" behaves differently than "Click" in Playwright
  await page.tap('button[aria-label="Open Menu"]');
  
  // Ensure the drawer slides in (animation check)
  await expect(page.locator('.nav-drawer')).toBeVisible();
});
```

## Summary

Use Chrome Emulation for iteration (speed). Use Real Devices for validation (truth).

If you have never loaded your app on a £150 Android phone over 4G, you have no idea what your global users are experiencing. You are optimising for the 1%.

## Key Takeaways

- **Performance differs drastically**: Run Lighthouse on a real device, not desktop. The scores will be 30 points lower.
- **Interactions are physical**: Swipe, pinch, and zoom are hard to emulate with a mouse.
- **Keyboard steals space**: The on-screen keyboard eats up 50% of the screen height. Does your form still work?

## Next Steps

- **Buy**: Get a cheap Android device for the office lab.
- **Throttle**: Use "Network Link Conditioner" on Mac to simulate packet loss, not just low bandwidth.
- **Cloud**: Set up a weekly job on BrowserStack/SauceLabs to run on real hardware.
