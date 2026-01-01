---
layout: post
title: "Race Condition Testing: The Ghosts in Your CI Pipeline"
date: 2023-03-16
category: QA
slug: race-condition-testing
gpgkey: "EBE8 BD81 6838 1BAF"
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Sleeping Beauty" Anti-Pattern](#the-sleeping-beauty-anti-pattern)
- [The Polling Solution](#the-polling-solution)
- [Code Snippet: A Robust Wait](#code-snippet-a-robust-wait)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Race conditions are the ghosts in the machine. In automated testing, they manifest as random failures that "fix themselves" when you re-run the pipeline.

"It worked on my machine!" screams the developer.
"It failed in CI!" replies the log.
"It passed on the second try!" says the Project Manager, who just wants to go home.

It is not a poltergeist; it is poor synchronisation.

## TL;DR

- **No Waits are naive**: Avoid `Thread.sleep(5000)`. It is naive, brittle, and slows down your suite.
- **Smart Waits are better**: Use "Wait until X happens" logic (Polling).
- **Isolation prevents interference**: Ensure tests do not share mutable state (e.g., the same user account).
- **Chaos sometimes helps**: Sometimes you need to *reduce* CPU resources to trigger the race condition reliably.

## The "Sleeping Beauty" Anti-Pattern

A race condition occurs when the outcome of your test depends on the sequence or timing of uncontrollable events.

**The Scenario**:

1. Test clicks "Submit".
2. Test immediately checks for "Success" message.
3. Server takes 500ms to process.
4. Test fails because the message was not there *yet*.

**The Wrong Fix**:
Adding `sleep(5000)` (Wait 5 seconds).

This turns your test suite into a nap suite.

- **Too Short**: If the server takes 5.1s, the test fails. Flaky.
- **Too Long**: If the server takes 0.1s, the test waits 4.9s for no reason. Slow.

## The Polling Solution

The solution is **Deterministic Polling**. You ask "Are we there yet?" every 100ms until the answer is "Yes" or you time out.

Most modern frameworks (Playwright, Cypress) do this automatically. Selenium (and Unit Tests) often need manual help.

## Code Snippet: A Robust Wait

Here is a robust, written-from-scratch polling utility in TypeScript. You essentially re-invent `await expect`, but understanding *how* it works is vital.

```typescript
/**
 * Waits for a condition to be true, polling every `interval` ms.
 * @param predicate Function returning true/false
 * @param timeout Max time to wait in ms
 * @param message Error message on timeout
 */
async function waitFor(
  predicate: () => Promise<boolean> | boolean,
  timeout = 5000,
  message = "Timed out waiting for condition"
): Promise<void> {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    if (await predicate()) {
      return; // Success! We stop waiting immediately.
    }
    // Wait 100ms before checking again
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  throw new Error(`${message} (waited ${timeout}ms)`);
}

// Usage Example
test('Order status updates to COMPLETE', async () => {
  await clickOrderButton();
  
  // Checking the Database (or API) needs a wait
  await waitFor(async () => {
    const status = await getOrderStatusFromDB();
    return status === 'COMPLETE';
  });
  
  expect(true).toBe(true); // If we pass the waitFor, we are good.
});
```

This ensures the test waits *exactly* as long as necessary. If the server is fast, the test is fast. If the server is slow, the test remains patient.

## Summary

Concurrency is not a problem to be avoided, but a reality to be managed. High-performance test suites embrace parallel execution.

If you cannot run your tests in parallel because "they interfere with each other", you do not have a test suite; you have a house of cards.

## Key Takeaways

- **Explicit over Implicit**: Define exactly what you are waiting for (Database state? DOM element? API 200 OK?).
- **Flakiness is a Bug**: Do not ignore "random" failures. They are race conditions waiting to happen in production users' browsers.
- **Fail Fast**: Set reasonable timeouts. If it takes >10 seconds, it is probably broken.

## Next Steps

- **Grep**: Search your codebase for `sleep(` or `delay(`.
- **Audit**: Replace them with explicit `waitFor` or `await expect(...)`.
- **Stress**: Run your flaky test 50 times in a row (`--repeat-each=50`) locally. If it fails once, fix it.
