---
layout: post
title: 'Browser Profile Isolation: The Fresh Start'
date: 2024-08-22
category: QA
slug: browser-profile-isolation
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "It Works on My Machine" Problem](#the-it-works-on-my-machine-problem)
- [Incognito is Not Enough](#incognito-is-not-enough)
- [Code Snippet: Isolation with Playwright Contexts](#code-snippet-isolation-with-playwright-contexts)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

"It works on my machine!"
"That's because you have a cookie from 2019 that bypasses the login bug, Dave."

Testing on a dirty browser profile is the root of many False Positives (and False Negatives). Profile Isolation ensures
every test starts from a clean slate. It simulates the "New User" experience, which is the most critical experience to
get right.

## TL;DR

- **Cookies need clearing**: Ensure no lingering auth tokens exist from previous runs.
- **LocalStorage survives restarts**: Often survives browser restarts. Needs explicit clearing.
- **Permissions reset in new profiles**: "Allow Notifications" prompt should appear *every time* in a new
  profile/context.

## The "It Works on My Machine" Problem

Developers and QAs tend to use the same browser profile for development and testing. It accumulates rubbish:

- Cached redirects (301s that stick forever).
- Accepted permission prompts (you clicked "Allow" 6 months ago).
- LocalStorage state (`hasSeenTutorial: true`).

Then they ship to a new user, and the onboarding flow explodes because the user *does not* have that magic local storage
key.

## Incognito is Not Enough

Incognito clears data when you close it. But multiple Incognito windows often *share* the same session if open
simultaneously.

If Test A logs in as Admin in Window 1... Test B in Window 2 might accidentally be logged in as Admin too.

This leads to "Flaky Tests" where Test B passes only if Test A runs first. This is a nightmare to debug.

## Code Snippet: Isolation with Playwright Contexts

Playwright solves this beautifully with `BrowserContexts`. A Context is like an Incognito window, but totally isolated
from other contexts (even if running in parallel).

```javascript
/*
  isolation.spec.js
  Scenario: Verify 2 users chatting in real-time
*/
const { test, expect } = require('@playwright/test');

test('should verify chat privacy between users', async ({ browser }) => {
  // Create two isolated contexts (like 2 separate devices)
  // Context A has its own cookies, storage, cache
  const userAContext = await browser.newContext();
  
  // Context B is completely empty
  const userBContext = await browser.newContext();

  const pageA = await userAContext.newPage();
  const pageB = await userBContext.newPage();

  // User A logs in
  await pageA.goto('/chat');
  await pageA.fill('#username', 'Alice');
  await pageA.click('#join');

  // User B logs in
  await pageB.goto('/chat');
  await pageB.fill('#username', 'Bob');
  await pageB.click('#join');
  
  // Verify User A cookie doesn't leak to User B
  const cookiesA = await userAContext.cookies();
  const cookiesB = await userBContext.cookies();
  
  expect(cookiesA).not.toEqual(cookiesB);
  
  // Verify chat
  await pageA.fill('#message', 'Hello Bob');
  await pageA.click('#send');
  
  // Page B should receive it
  await expect(pageB.locator('.message')).toHaveText('Hello Bob');
});
```

## Summary

Isolation is the key to reproducible testing. If your tests depend on the order they run in (polluting global state),
you are building a house of cards.

Use contexts. Be clean. Be stateless.

## Key Takeaways

- **Parallelism enables speed**: Robust isolation allows you to run 50 tests in parallel on the same machine without
  them colliding.
- **Service Workers persist stubbornly**: These stick around like chewing gum on a shoe. Ensure your isolation strategy
  unregisters them or starts fresh.
- **Cache testing needs explicit setup**: Sometimes you *want* to test cached behaviour (e.g. "Returning User"). In that
  case, use a Persistent Context, but manage it explicitly.

## Next Steps

- **Tool**: Use **Docker** to ensure the entire OS environment is fresh for every test run (CI/CD standard).
- **Learn**: Understand **First-Party Sets** and how browsers partition storage to prevent tracking.
- **Audit**: Check if your tests fail when run in random order (`--shuffle`). If they do, you have an isolation bug
  (leaking state).
