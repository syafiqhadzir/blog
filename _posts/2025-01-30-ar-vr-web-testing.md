---
layout: post
title: 'AR/VR Web Testing: Don''t Throw Up'
date: 2025-01-30
category: QA
slug: ar-vr-web-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [WebXR: The Browser in 3D](#webxr-the-browser-in-3d)
- [Motion Sickness Testing (The Vomit Comet)](#motion-sickness-testing-the-vomit-comet)
- [Code Snippet: Mocking the Headset](#code-snippet-mocking-the-headset)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Virtual Reality on the Web (WebXR) is here.

Testing 2D screens is easy. Testing 3D space is... physically demanding. If your frame rate drops below 90fps, the user
gets motion sickness. If the tracking lags by 20ms, the user gets motion sickness.

QA's job is not just "Does it work?", but "Is it physically safe to use?" Warning: Keep a bucket next to your desk.

## TL;DR

- **FPS must be stable**: Must be stable 90Hz+ (or 120Hz on Quest 3). Jitter causes nausea.
- **Input varies wildly**: Hand tracking, Controllers, Gaze. Test them all. Users *will* try to punch the virtual button
  instead of clicking it.
- **Safety must be verified**: Does the user walk into a real-world wall? (The "Guardian" boundary). Your app should not
  encourage users to sprint across the living room.

## WebXR: The Browser in 3D

Chrome on the Oculus Quest / Apple Vision Pro is surprisingly capable. But debugging is hard because the console is
inside the headset.

Use **Remote Debugging** (USB-C cable + `chrome://inspect`). You look ridiculous wearing a headset whilst typing blindly
on a laptop, but that is the job. "I'm in the matrix, boss. Fixing bugs."

## Motion Sickness Testing (The Vomit Comet)

Why do we get sick? Sensory conflict.
Eyes say: "We are moving forward at 100mph."
Inner Ear says: "We are sitting in an office chair."
Brain says: "We have been poisoned by berries. Eject stomach contents immediately."

**QA Strategy**: Test **Locomotion**.

- **Teleportation**: (Click to move). Safer.
- **Smooth Walking**: (Joystick). Riskier.
- **Vignette**: (Darken edges when moving). Helps reduce sickness.

If you feel bad, STOP immediately. Do not "power through". The brain learns to associate VR with sickness (Pavlovian
response).

## Code Snippet: Mocking the Headset

You cannot automate a physical headset easily. But you can mock the API to test the logic on CI.

```javascript
/*
  webxr.spec.js
*/
const { test, expect } = require('@playwright/test');

test('should enter immersive VR mode', async ({ page }) => {
  // Use a mock to trick the browser into thinking a headset is connected
  await page.addInitScript(() => {
    navigator.xr = {
      isSessionSupported: (mode) => Promise.resolve(mode === 'immersive-vr'),
      requestSession: () => Promise.resolve({
        end: () => Promise.resolve(),
        addEventListener: () => {},
        requestAnimationFrame: (cb) => {
             // Simulate a render loop
             setTimeout(() => cb(Date.now()), 16) 
             return 1;
        },
        // ... simplistic mock ...
      })
    };
  });

  await page.goto('/vr-experience');
  
  // The "Enter VR" button should depend on isSessionSupported()
  const enterBtn = page.locator('#enter-vr');
  await expect(enterBtn).toBeEnabled();
  
  await enterBtn.click();
  
  // Verify UI state changes
  await expect(page.locator('#session-status')).toHaveText('Presenting');
});
```

## Summary

AR/VR is the next frontier. It brings new bug categories:

- "My hand went through the table." (Collision Detection)
- "The text is unreadable up close." (Near Clipping Plane)
- "I felt dizzy after 2 minutes." (Bad Performance)

Get your "VR Legs" ready.

## Key Takeaways

- **Comfort affects usability**: Can I read the text without straining my neck? UI elements should be at eye level, not
  on the ceiling.
- **Audio must be spatial**: If the zombie groans on the left, I should hear it in my left ear. If I turn my head, the
  sound should move.
- **Battery drain is significant**: VR apps drain battery fast. Measure the energy impact. Only use high-res textures
  where they matter.

## Next Steps

- **Tool**: Install the **WebXR API Emulator** extension for Chrome/Firefox. It lets you manipulate a virtual
  headset/controllers with your mouse.
- **Learn**: Understand **Three.js** and **A-Frame**. This is the jQuery of VR.
- **Audit**: Check your glTF models. Are they 50MB uncompressed? Compress them using **Draco**.
