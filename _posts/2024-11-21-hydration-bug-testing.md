---
layout: post
title: 'Hydration Bug Testing: React vs. The User'
date: 2024-11-21
category: QA
slug: hydration-bug-testing
gpgkey: EBE8 BD81 6838 1BAF
tags: ['philosophy']
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The AdBlocker Nightmare](#the-adblocker-nightmare)
- [Extensions Injection](#extensions-injection)
- [Code Snippet: Suppressing Hydration Warnings](#code-snippet-suppressing-hydration-warnings)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

You built a beautiful Next.js app. You tested it on Localhost. It was perfect.

Then User Dave visited it. Dave has "Super Ultra AdBlocker Chrome Extension"
installed. The extension injected a `<div id="ad-blocker-pixel">` into your
`<body>` before React loaded.

React saw this extra div, screamed "HYDRATION MISMATCH", and blew up the page.
Welcome to the wild west of the Client Side, where you do not own the DOM.

## TL;DR

- **Extensions modify the DOM**: Browser extensions modify the DOM _before_
  React hydrates. This breaks React's reconciliation.
- **Translation causes issues**: Chrome's auto-translate modifies text nodes. If
  a user translates your app to Spanish, React might crash when it tries to
  update the "Submit" button.
- **Fix with intentional strategies**: Use `suppressHydrationWarning` on
  specific elements, or force Client-side only rendering for volatile
  components.

## The AdBlocker Nightmare

AdBlockers are aggressive. They do not just hide ads; they restructure your
HTML. They strip `class="ad-banner"` and sometimes inject their own
placeholders.

If your app crashes because an ad `<iframe>` was removed or replaced, your error
handling is too weak.

**QA Strategy**: Install the top 5 blockers (uBlock, AdBlock Plus, Privacy
Badger) and run your E2E suite. Yes, your tests _should_ fail. Then fix the app
to handle it gracefully (e.g., Error Boundaries).

## Extensions Injection

Grammarly adds DOM nodes to textareas. LastPass adds icons to input fields.
Honey adds a popup to your checkout button.

React hates this. It expects the DOM to be exactly what its Virtual DOM says it
is. When it finds a LastPass icon inside an `<input>`, it might double-render,
lose focus, or throw a cryptic `Minified React Error #418`.

## Code Snippet: Suppressing Hydration Warnings

Sometimes you know the server and client will differ (e.g., a "Last Updated: 5
mins ago" label, or a Random Number). Tell React to chill.

```javascript
/*
  Timestamp.jsx
*/
import React, { useState, useEffect } from 'react';

function Timestamp({ date }) {
  // Option 1: The Cheat Code (Use sparingly)
  // Server renders "12:00". Client might render "12:01".
  // suppressHydrationWarning silences the error for THIS element only.
  // Note: It doesn't fix the mismatch; it just ignores it.

  /*
  return (
    <span suppressHydrationWarning>
      {new Date(date).toLocaleTimeString()}
    </span>
  );
  */

  // Option 2: The Correct Way (2-Pass Rendering)
  // 1. Render empty (or server-safe value) first.
  // 2. Update to client-specific value after mount.
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null; // Or return server-safe fallback

  return <span>{new Date(date).toLocaleTimeString()}</span>;
}

// QA Test to ensure we don't suppress REAL errors
test('should log real hydration errors but ignore intentional ones', async ({
  page,
}) => {
  page.on('console', (msg) => {
    if (
      msg.text().includes('Hydration failed') &&
      !msg.text().includes('Timestamp')
    ) {
      throw new Error(`Real Hydration Error Detected: ${msg.text()}`);
    }
  });
});
```

## Summary

Hydration bugs are the "works on my machine" of the frontend world. You cannot
control the user's browser environment.

But you can build a UI that does not shatter like glass when a user installs a
coupon code finder. Resilience > Perfection.

## Key Takeaways

- **2-Pass Rendering avoids mismatches**: Render a skeleton first (server
  compatible), then update via `useEffect` (client only). This avoids the
  mismatch entirely.
- **NoScript users exist**: Does your app work if JS is disabled? (Some users do
  this for security/privacy). If not, do you show a polite message?
- **Error Boundaries contain damage**: Wrap your components. If the "Sidebar"
  crashes due to hydration, the "Main Content" should still be visible.

## Next Steps

- **Tool**: Use **Hydration Overlay** (a developer tool) to visualise exactly
  which pixels mismatched.
- **Learn**: React 18's **Streaming SSR** and **Suspense**. It sends HTML in
  chunks, making hydration less "blocky" but more complex to debug.
- **Audit**: Do you have `typeof window !== 'undefined'` checks everywhere? That
  is a code smell. Use `useEffect` instead.
