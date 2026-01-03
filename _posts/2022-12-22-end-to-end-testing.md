---
layout: post
title: 'End-to-End Testing: Why ''Works on My Machine'' Means Nothing'
date: 2022-12-22
category: QA
slug: end-to-end-testing
gpgkey: 4AEE 18F8 3AFD EB23
tags:
- e2e-testing
- strategies
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Manual vs Automated: Scythes vs Combines](#manual-vs-automated-scythes-vs-combines)
- [The Two Flavours: Horizontal \& Vertical](#the-two-flavours-horizontal--vertical)
- [Code Snippet: Modern Playwright](#code-snippet-modern-playwright)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

End-to-end (E2E) testing is the ultimate reality check. Unit tests prove the logic works; Integration tests prove the
components talk to each other; E2E tests prove that the user can actually buy the t-shirt.

It ensures that applications behave as expected from the real-world end user's perspective. It does not care if your
Redux store is pure; it cares if the "Buy" button is clickable or covered by a GDPR banner.

## TL;DR

- **Reality Check**: Validates the entire flow, start to finish.
- **Manual testing has limits**: Great for finding "weird" bugs, terrible for repetitive checking.
- **Automated testing is essential**: Essential for regression. If you test it manually every day, you are the robot.
- **Tools have evolved**: Playwright and Cypress have killed Selenium (mostly).

## Manual vs Automated: Scythes vs Combines

**Manual testing** is crucial for "vibes" based testing. Does the animation feel janky? Is the colour palette offensive?

However, relying on manual testing for regression (checking if the login still works) is like trying to mow a football
pitch with kitchen scissors. Possible? Yes. Painful? Excruciatingly.

**Automation** allows you to sleep at night knowing the critical paths are not broken.

## The Two Flavours: Horizontal & Vertical

1. **Horizontal**: Testing the flow across multiple applications.
    - *Example*: User buys on Web -> Inventory updates in ERP -> Email sent via SaaS.
2. **Vertical**: Testing the layers of a single application.
    - *Example*: HTML -> API -> Database -> HTML.

## Code Snippet: Modern Playwright

Gone are the days of flaky Selenium scripts that broke if you looked at them funny. Modern tools like Playwright are
fast, reliable, and handle "waiting" automatically.

```typescript
import { test, expect } from '@playwright/test';

test('User can complete a purchase flow', async ({ page }) => {
  // 1. Visit the Shop
  await page.goto('https://shop.example.com');
  
  // 2. Add to Cart (User interaction)
  // Note: We prioritise user-visible labels, not CSS classes.
  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
  
  // 3. Checkout
  await page.getByRole('link', { name: 'Checkout' }).click();
  
  // 4. Fill Form
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByRole('button', { name: 'Pay Now' }).click();
  
  // 5. Assert Success
  // This is the "End" of End-to-End. Proof of value.
  await expect(page.getByText('Thank you for your order')).toBeVisible();
});
```

This script acts exactly like a user. It does not care about the code implementation; it only cares about the outcome.

## Summary

E2E testing is the final exam for your code before it graduates to production. It is expensive to run (slow) and
expensive to maintain (brittle), so use it wisely.

Do not test *everything* E2E. Test the money paths.

## Key Takeaways

- **User Perspective matters**: Test what the user sees, not what the code does.
- **Pyramid Principle applies**: E2E is the top of the pyramid. Have fewer of them than unit tests.
- **Flakiness destroys trust**: A flaky E2E test is worse than no test. Fix it or delete it.

## Next Steps

- **Identify the Money**: What is the one flow that *must* work for you to get paid?
- **Automate It**: Write one E2E test for that path this week.
- **Run on CI**: If it does not run in CI, it does not exist.
