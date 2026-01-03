---
layout: post
title: 'Building the Test Pyramid: Why Your Build Takes 4 Hours'
date: 2023-03-02
category: QA
slug: building-test-pyramid
gpgkey: EBE8 BD81 6838 1BAF
tags:
- strategies
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Ice Cream Cone of Death](#the-ice-cream-cone-of-death)
- [Restoring the Balance](#restoring-the-balance)
- [Code Snippet: The Cost of Laziness](#code-snippet-the-cost-of-laziness)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

The Test Pyramid (coined by Mike Cohn) is the healthy food pyramid of software. Be honest: your diet is mostly pizza
(E2E tests) and very little broccoli (Unit tests), is it not?

Many teams accidentally build the "Ice Cream Cone" anti-pattern: tons of slow, flaky UI tests and almost no unit tests.
The result? A build pipeline that takes 4 hours, fails randomly because the wind blew, and makes everyone hate Tuesdays.

## TL;DR

- **Unit Tests (70%)**: Fast, isolated, check logic. If it fails, you know exactly which line is broken.
- **Integration Tests (20%)**: Check databases, APIs, and connections.
- **E2E Tests (10%)**: Check the user flow. Slow, expensive, and flaky.
- **Strategy**: Push tests down. If you can test it with a Unit Test, do NOT test it with Selenium.

## The Ice Cream Cone of Death

Why do teams end up with the inverted pyramid? Because UI tests feel "real". It is satisfying to watch a bot click
through the app. "Look! It's working!"

But this addiction comes at a cost.

- **Fragility**: Changing a CSS class name breaks the test. The feature works, but the test fails.
- **Speed**: UI tests take seconds. Unit tests take milliseconds.
- **Diagnosis**: When a UI test fails, it says "Element not found". When a Unit test fails, it says "Expected 4, got 5".

## Restoring the Balance

To fix this, we must be ruthless.

1. **Refactor**: Extract logic from UI components into utility functions.
2. **Mock**: Use mocks for integration tests to avoid spinning up real databases.
3. **Delete**: If an E2E test covers the same logic as a unit test, delete the E2E test. It is dead weight.

## Code Snippet: The Cost of Laziness

Here is the same test implemented at two levels. Note the difference in complexity.

### Level 1: Unit Test (The Broccoli)

```javascript
// logic.js
export const calculateTax = (price, region) => {
  if (region === 'UK') return price * 0.20;
  return 0;
};

// logic.test.js
test('calculates UK tax correctly', () => {
  expect(calculateTax(100, 'UK')).toBe(20);
});
// Runtime: 2ms. dependencies: None. Reliable: 100%.
```

### Level 2: E2E Test (The Pizza)

```javascript
// checkout.spec.js
test('calculates UK tax in UI', async ({ page }) => {
  await page.goto('/checkout');
  await page.fill('#region', 'UK');
  await page.fill('#price', '100');
  
  // Wait for network, wait for render, wait for animation...
  // If the API is slow today, this fails.
  await page.waitForTimeout(500); 
  
  const tax = await page.textContent('#tax-amount');
  expect(tax).toBe('£20.00');
});
// Runtime: 5000ms. dependencies: Network, Browser, API, Database, CSS. Reliable: 50%.
```

The E2E test is **2,500x slower** and validates the exact same maths. Why are you doing this to yourself?

## Summary

The goal is not to eliminate E2E tests—they are vital for ensuring the system works as a whole. The goal is to use them
sparingly.

Save the heavy artillery for the critical user journeys (Login, Checkout) and use the sniper rifle (Unit Tests) for
everything else.

## Key Takeaways

- **Speed Wins**: Faster feedback loops mean happier developers.
- **Push Down**: Always ask "Can I test this without a browser?"
- **Maintenance**: Every E2E test you write is a debt you have to pay later.

## Next Steps

- **Audit**: Count your tests. Draw your pyramid. Cry.
- **Prune**: Find 5 flaky E2E tests and replace them with Unit tests.
- **Refactor**: Move logic out of your React components and into plain TS/JS files.
