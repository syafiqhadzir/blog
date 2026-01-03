---
layout: post
title: 'Personalised Quality: The Death of the ''Average User'''
date: 2025-10-16
category: QA
slug: personalized-quality
gpgkey: EBE8 BD81 6838 1BAF
tags: ["qa-general"]
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Death of the "Average User"](#the-death-of-the-average-user)
- [Adaptive UI Testing](#adaptive-ui-testing)
- [Code Snippet: Dynamic Feature Switching](#code-snippet-dynamic-feature-switching)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

QA traditionally defines a "Golden Path". "The user logs in, clicks Buy, and sees the Thank You page." Simple. Clean.
Entirely fictional.

What if the user is seventy years old, colour-blind, on a 3G connection in a tunnel? What if the user is a sixteen-year-
old eSports professional on fibre in Seoul?

**Personalised Quality** means the app adapts itself. The "Golden Path" is now dynamic. "One size fits all" is a lie we
tell ourselves to ship faster.

## TL;DR

- **Adaptive bitrate applies to features**: Like Netflix quality adjustment. If the network drops, the quality drops,
  but the video keeps playing. Apply this to *software features*. Disable animations if the battery is low.
- **Preference testing catches the flashbang**: If the user selects "Dark Mode", do they ever see a white flash? (The
  "Flashbang" bug. It burns.)
- **Accessibility is usability**: It is not a compliance tick-box. Try using your app with your eyes closed (Screen
  Reader). It is humbling.

## The Death of the "Average User"

Stop testing on an iPhone 15 Pro on corporate Wi-Fi. That is not the real world. That is the fantasy world where
developers live.

Test on:

1. **The Commuter**: Signal drops every two minutes (Underground).
2. **The Battery Saver**: CPU is throttled to 20% because battery is below 10%.
3. **The Power User**: Has five hundred tabs open. RAM is full. The browser is crying.

## Adaptive UI Testing

If the user has **Tremors**, the UI should increase button hit areas. If the user has **ADHD**, the UI should remove
distracting animations.

**QA Strategy**: Inject "User Context" into your E2E tests. `test('should disable animations for prefers-reduced-
motion')`.

## Code Snippet: Dynamic Feature Switching

Testing a component that degrades gracefully based on device capabilities (Hardware Concurrency).

```javascript
/*
  adaptive-ui.spec.js
*/

// Component Logic (Conceptual)
function getParticleCount() {
    // If user has 8+ cores, give them the fireworks.
    // If user has 2 cores, give them a static image.
    if (navigator.hardwareConcurrency >= 8) return 1000;
    if (navigator.hardwareConcurrency >= 4) return 500;
    return 0; // Low-end device. Save the battery.
}

describe('Adaptive Performance', () => {
    
    test('High-end device gets maximum fidelity', () => {
        // Mocking the hardware
        Object.defineProperty(navigator, 'hardwareConcurrency', { value: 16, configurable: true });
        expect(getParticleCount()).toBe(1000);
    });

    test('Mid-range device gets balanced experience', () => {
        Object.defineProperty(navigator, 'hardwareConcurrency', { value: 4, configurable: true });
        expect(getParticleCount()).toBe(500);
    });

    test('Low-end device gets functional but minimal experience', () => {
        Object.defineProperty(navigator, 'hardwareConcurrency', { value: 1, configurable: true });
        expect(getParticleCount()).toBe(0); // Feature Flagged OFF
    });
});
```

## Summary

Quality is subjective. To the gamer, "Quality" is 144 FPS. To the journalist, "Quality" is text readability. To the
business, "Quality" is conversion rate.

Your test suite must protect *all* these definitions. You are the diplomat between these tribes, and diplomacy is
exhausting.

## Key Takeaways

- **Context-awareness saves data plans**: The app should know if it is running on a metered connection and stop auto-
  playing videos. If it does not, you are stealing the user's data allowance.
- **User overrides prevent nannying**: Always allow the user to say "I know my battery is low, but I want High Quality
  anyway." Do not be a nanny.
- **Telemetry beats guessing**: Do not guess. Measure. "How many users are on devices with less than 4GB RAM?" If it is
  20%, you had better optimise for it.

## Next Steps

- **Tool**: **Playwright** Device Descriptors (Emulate `Pixel 5`, `Moto G4`).
- **API**: Use `NetworkInformation` API (`navigator.connection.saveData`) in your tests.
- **Read**: *Design for Real Life* by Sara Wachter-Boettcher. It changes how you see users.
