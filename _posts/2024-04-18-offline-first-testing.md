---
layout: post
title: 'Offline-First Testing: When the WiFi Dies in the Tunnel'
date: 2024-04-18
category: QA
slug: offline-first-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:
- progressive-web-apps
- strategies
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Optimistic UI" Lie](#the-optimistic-ui-lie)
- [Conflict Resolution: The Cage Match](#conflict-resolution-the-cage-match)
- [Code Snippet: Simulating Offline Mode with Playwright](#code-snippet-simulating-offline-mode-with-playwright)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

You are on a train. You just wrote a 500-word review of a restaurant. The train goes into a tunnel. You hit "Submit".

If your app says "Network Error" and deletes the review, you will throw your phone out the window.

Offline-First means the app works *without* the internet, and syncs when it comes back. Testing this requires you to be
the "Chaos Monkey" of connectivity.

## TL;DR

- **Queues store offline actions**: Offline actions must be queued (IndexedDB/Redux Persist).
- **Indicators inform users**: The user must know they are offline ("You are offline. Changes saved locally.").
- **Sync must be ordered**: When the internet returns, the queue must process in order (FIFO).

## The "Optimistic UI" Lie

Optimistic UI means showing the success state *before* the server confirms it. User clicks "Like" -> Heart turns red
immediately.

But what if the request fails?

### QA Scenario: "The False Hope"

1. Go Offline.
2. Click "Like".
3. Verify Heart is Red.
4. Reload Page.
5. Verify Heart is still Red (Persistence).

If the heart turns white on reload, you lied to the user.

## Conflict Resolution: The Cage Match

User A (on a plane) edits Doc X.
User B (in the office) edits Doc X.
User A lands and syncs.
Who wins?

- **Last Write Wins**: User B cries.
- **Manual Merge**: User A is confused.
- **CRDTs**: Magic ensues.

QA must verify the conflict policy specifically. "Last Write Wins" is the default, but often wrong for collaborative
apps.

## Code Snippet: Simulating Offline Mode with Playwright

We can use Playwright to simulate a network failure mid-test.

```javascript
/* 
  offline.spec.js 
  Goal: Verify that data is not lost when the network vanishes.
*/
const { test, expect } = require('@playwright/test');

test('should queue review when offline', async ({ page, context }) => {
  await page.goto('/restaurant/1');
  
  // 1. Fill out the form
  await page.fill('#review', 'Great food!');
  
  // 2. Go Offline (Simulates Aeroplane Mode)
  await context.setOffline(true);
  
  // 3. Submit
  await page.click('#submit');
  
  // 4. Verify Optimistic UI (The user thinks it worked)
  await expect(page.locator('.toast')).toHaveText('Review saved locally');
  
  // 5. Go Online
  await context.setOffline(false);
  
  // 6. Verify Sync (Wait for the background sync to fire)
  // We expect the POST request to go out now
  const response = await page.waitForResponse(resp => 
    resp.url().includes('/api/reviews') && resp.status() === 200
  );
  
  // 7. Verify the DB actually has it (Optional integration check)
});
```

## Summary

Offline-first applications are robust, resilient, and really hard to build. If you treat the network as an optional
enhancement rather than a requirement, you build better software.

But you also build a massive pile of edge cases for QA to test.

## Key Takeaways

- **IndexedDB scales better**: LocalStorage is synchronous and limited (5MB). Use IndexedDB for real data.
- **Retries need backoff**: Do not retry instantly. Use "Exponential Backoff" so you do not DDoS your own server when
  10,000 users come back online at once.
- **Idempotency prevents duplicates**: If the sync request sends twice, does the user get charged twice?

## Next Steps

- **Tool**: Use **Workbox** Background Sync for easy implementation.
- **Learn**: Study **PouchDB / CouchDB** replication protocols.
- **Audit**: Turn off your WiFi and try to use your own app for 10 minutes.
