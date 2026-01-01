---
layout: post
title: 'Technical Debt in Testing: The Credit Card You Cannot Pay Off'
date: 2022-12-29
category: QA
slug: technical-debt-in-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Interest Rate is 100%](#the-interest-rate-is-100)
- [Forms of Debt](#forms-of-debt)
- [Code Snippet: The Dirty vs The Clean](#code-snippet-the-dirty-vs-the-clean)
- [The Audit: Are You Bankrupt?](#the-audit-are-you-bankrupt)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Technical debt in testing is like eating fast food for every meal. It feels great (and cheap) in the moment, but six months later, you wake up and realise you cannot climb a flight of stairs (deploy to production) without having a heart attack (pipeline failure).

It manifests as flaky tests, slow CI pipelines, and a test suite that everyone is terrified to touch.

## TL;DR

- **The Cost is real**: Speed over quality creates long-term pain. You borrow time from your future self.
- **The Symptom is obvious**: "Just re-run the test, it usually passes." This is the death rattle of your suite.
- **The Fix requires effort**: Refactor test code with the same obsession you apply to production code.

## The Interest Rate is 100%

When we shortcut test design—like hardcoding environment variables, using `sleep(5000)`, or copy-pasting setup logic—we are not just saving time; we are taking out a loan from a loan shark.

The interest is paid every time a developer waits 40 minutes for a suite that fails because of "network issues" (read: bad code).

## Forms of Debt

1. **Hardcoded Data**: `expect(user.id).toBe(123)`. What happens when the DB resets? You cry.
2. **No Abstraction**: You copied the login steps into 50 different test files. Now the login page changed. You have to update 50 files. Enjoy your weekend.
3. **Flakiness**: Tests that pass 80% of the time are worse than tests that fail 100% of the time. They erode trust.

## Code Snippet: The Dirty vs The Clean

**The Debt Way (Do not do this):**

```javascript
test('Buy Item', async () => {
  // Hardcoded selectors, magical waits, no abstraction
  await page.click('.btn-primary'); 
  await page.waitForTimeout(5000); // The "Hope and Pray" wait
  // If the network is slow, this fails. If it's fast, we wasted 4 seconds.
  await page.click('#id_123');
});
```

**The Clean Way:**

```javascript
// Page Object Model (POM) abstraction
class CartPage {
  constructor(page) { this.page = page; }
  
  async addItem(itemId) {
    // Robust selector
    await this.page.click(`[data-testid="${itemId}"]`);
    // Explicit wait involves logic, not time
    await this.page.waitForSelector('.cart-badge'); 
  }
}

test('Buy Item', async ({ page }) => {
  const cart = new CartPage(page);
  await cart.addItem('product-xyz');
});
```

The second one reads like English. The first one reads like a ransom note.

## The Audit: Are You Bankrupt?

Ask yourself these questions. Be honest.

- Are test wait times increasing even though you have not added new features?
- Do you have a "Flaky" column on your Jira board?
- Does it take >1 hour to onboard a new engineer because they cannot get the tests to run locally?
- Do you have commented-out tests with `// TODO: Fix later`? (Spoiler: You never will).

## Summary

If you do not pay off your debt, the debt will eventually pay you off—by making your release cycle impossible.

Start small. Delete the worst test you have. It is cathartic.

## Key Takeaways

- **Refactor Early**: Do not let rot set in.
- **Page Objects reduce duplication**: Use patterns to reduce duplication.
- **Delete Tests**: If a test creates more noise than value, delete it. It is not an asset; it is a liability.

## Next Steps

- **Grep for `sleep`**: Find all hardcoded waits and replace them with explicit assertions.
- **Delete One Test**: Find the flakiest test you have and delete it. See if anyone notices.
