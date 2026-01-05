---
layout: post
title: 'Spatial Audio Testing: The Zombie Behind You'
date: 2025-02-06
category: QA
slug: spatial-audio-testing
gpgkey: EBE8 BD81 6838 1BAF
tags: ['spatial-computing', 'emerging-tech']
description:
  'In a 2D Zoom call, everyone sounds like they are inside your head. It is flat
  (Mono/Stereo).'
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [HRTF and The Web Audio API](#hrtf-and-the-web-audio-api)
- [The "Front-Back Confusion" Bug](#the-front-back-confusion-bug)
- [Code Snippet: Positioning the Listener](#code-snippet-positioning-the-listener)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

In a 2D Zoom call, everyone sounds like they are inside your head. It is flat
(Mono/Stereo).

In a Metaverse, VR game, or high-end web experience, location matters. If the
zombie groans on your left, but you hear it on your right, you turn right... and
die. If the virtual conference speaker walks behind you, their voice should move
behind you.

Spatial Audio QA is a matter of life and death (virtually).

## TL;DR

- **Panning reveals direction**: Left/Right stereo separation. If I turn 90
  degrees left, the sound source should move 90 degrees right.
- **Distance Model affects volume**: Does the sound get quieter as I walk away?
  (Inverse Distance Law). Does it vanish at `maxDistance`?
- **Environment adds realism**: Does the cave echo (Reverb)? Does the carpet
  muffle footsteps (Occlusion)?

## HRTF and The Web Audio API

**HRTF (Head-Related Transfer Function)**: A fancy maths way of saying "how your
ears and skull shape sound".

The `PannerNode` in the Web Audio API handles this. It takes `(x, y, z)`
coordinates for the Source (Zombie) and the Listener (You).

**QA Strategy**: You cannot just check the coordinates in the DB. You must
listen. Or... you can programmatically check if the `PannerNode` values are
updating in real-time.

## The "Front-Back Confusion" Bug

It is easy to tell Left from Right (Interaural Time Difference). It is hard to
tell Front from Back (without moving your head).

If the audio engine is cheap/bad, Front and Back sound identical. This is a bug
in VR. The "Cone of Silence" (Directional Sound) must be configured correctly.

**QA Test**: Close your eyes. Spin your character. Can you track the object
purely by sound?

## Code Snippet: Positioning the Listener

Verify that the Audio Context is tracking the user's movement. If the visual
avatar moves but the "Audio Ear" stays at `(0,0,0)`, the immersion breaks.

```javascript
/*
  spatial-audio.spec.js
*/
const { test, expect } = require('@playwright/test');

test('should update audio listener position on movement', async ({ page }) => {
  await page.goto('/3d-world');

  // 1. Get initial listener position
  const initialZ = await page.evaluate(
    () => window.audioContext.listener.positionZ.value,
  );

  // 2. Move the avatar forward (Press Up Arrow)
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(100); // Wait for render loop

  // 3. Check Web Audio API state
  // ideally, listener Z should decrease (moving into the screen)
  const newPosition = await page.evaluate(() => {
    const ctx = window.audioContext;
    const listener = ctx.listener;
    return {
      x: listener.positionX.value,
      y: listener.positionY.value,
      z: listener.positionZ.value,
    };
  });

  console.log('New Listener Pos:', newPosition);

  // 4. Verify Z changed
  expect(newPosition.z).not.toBe(initialZ);
});
```

## Summary

Testing audio is usually "Can I hear it?". Testing Spatial Audio is "WHERE is
it?".

It requires a good pair of headphones and a quiet room. Tell your boss you need
£400 noise-cancelling headphones "for testing purposes". (It might even be
true).

## Key Takeaways

- **Doppler Effect needs verification**: As the race car passes you, the pitch
  should drop (`neeeeee-owwwww`). Web Audio API does this automatically _if_ you
  set velocity. Check if velocity is set.
- **Occlusion adds realism**: If I stand behind a wall, the sound should be
  muffled (Low Pass Filter). Most engines do not do this automatically; devs
  have to code it. Test it.
- **Latency causes motion sickness**: Spatial calculations are heavy. If the
  audio lags the video by >100ms, motion sickness ensues.

## Next Steps

- **Tool**: Use **Resonance Audio** SDK (Google) for high-fidelity
  spatialisation on the web.
- **Learn**: Read about **Ambisonics** (360-degree audio format like a skybox
  for sound).
- **Audit**: Check your sample rates. 44.1kHz vs 48kHz mismatches cause
  clicking/popping.
