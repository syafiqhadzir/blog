---
layout: post
title: 'PWA Testing: Is it an App? Is it a Site? No, it''s a Nightmare.'
date: 2024-04-11
category: QA
slug: qa-for-pwas
gpgkey: EBE8 BD81 6838 1BAF
tags: ["progressive-web-apps", "mobile-testing"]
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Service Worker Cache Trap](#the-service-worker-cache-trap)
- [The "Add to Home Screen" Dice Roll](#the-add-to-home-screen-dice-roll)
- [Code Snippet: Forcing a Service Worker Update](#code-snippet-forcing-a-service-worker-update)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Progressive Web Apps (PWAs) are the "Gluten-Free" of software development. They promise to be healthy, light, and good
for everyone.

In reality, they are often dry, crumbly, and hard to swallow.

A PWA is just a website that pretends to be a native app. And the heart of this deception is the **Service Worker**.

## TL;DR

- **Offline must work**: If I turn on "Aeroplane Mode" and reload, do I get a dinosaur or your app?
- **Updates must propagate**: If I deploy new code, does the user see it, or are they stuck in 2019 because of your
  cache policy?
- **Manifest must be complete**: If `manifest.json` is missing a 192x192 icon, Android will silently hate you.

## The Service Worker Cache Trap

The Service Worker is a script that sits between the browser and the network. It can intercept requests and serve cached
content. This makes the app fast.

It also means that if you ship a bug, that bug is cached **forever** on the user's phone.

**QA Scenario: "The Poisoned Cache"**
Deploy Bug -> User Visits -> Deploy Fix -> User Visits -> User STILL sees Bug.

You need a "Kill Switch" for your service worker.

## The "Add to Home Screen" Dice Roll

Browsers use heuristically determined criteria to decide when to show the "Add to Home Screen" prompt (A2HS).

"User must have visited the site twice, with at least 5 minutes between visits."

Good luck automating that test in Selenium.

**QA Strategy**: Trigger the prompt programmatically (where possible) or trust the Lighthouse audit.

## Code Snippet: Forcing a Service Worker Update

Testing updates is hard. Here is how to programmatically force a check for a new Service Worker version in the browser
console.

```javascript
/* 
  forceUpdate.js
  Run this in the DevTools console to debug caching issues.
*/
async function checkUpdate() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    
    console.log("Checking for updates...");
    await registration.update();
    
    // If a new SW is waiting to activate
    if (registration.waiting) {
      console.log("New version found! Swapping now.");
      
      // Send a message to the worker to skip waiting and activate immediately
      // Note: Your SW code must handle the 'SKIP_WAITING' message!
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page to load the new assets
      window.location.reload();
    } else {
      console.log("You are on the latest version.");
    }
  } else {
    console.log("Service Workers are not supported in this browser.");
  }
}

// Call it manually during testing
checkUpdate();
```

## Summary

PWAs are powerful, but they shift the complexity from the server to the client. You are essentially installing a proxy
server on the user's device.

Treat it with the respect (and fear) it deserves.

## Key Takeaways

- **Storage limits vary**: IndexedDB limits vary by device (iOS is stricter). Do not try to store 500MB of HD video on a
  low-end Android.
- **Background Sync needs testing**: Test what happens when the user does an action offline and then closes the app.
  Does it sync when they come back online?
- **Scope limits coverage**: Ensure your Service Worker scope (`/app/`) does not accidentally hijack your marketing
  pages (`/`).

## Next Steps

- **Tool**: Use **Lighthouse** in Chrome DevTools. If you do not score 100 on PWA, you fail.
- **Learn**: Read about **Workbox** (Google's library for sane Service Workers).
- **Audit**: Check your `robots.txt`. If Googlebot cannot read your PWA, you do not exist.
