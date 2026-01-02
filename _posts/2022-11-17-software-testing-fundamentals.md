---
layout: post
title: 'Software Testing Fundamentals: All Code Is Guilty'
date: 2022-11-17
category: QA
slug: software-testing-fundamentals
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Guilty Until Proven Innocent](#guilty-until-proven-innocent)
- [Severity vs Priority: The Cage Match](#severity-vs-priority-the-cage-match)
- [Code Snippet: Tagging Priorities](#code-snippet-tagging-priorities)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Software testing is often treated like flossing: everyone says they do it, but most people only do it furiously right
before the dentist (or the Release Manager) inspects their work.

But testing is not just a chore. It is the art of strategic pessimism. To succeed, you must accept one fundamental
truth: Developers are optimists. They believe `2 + 2 = 4`. We are the realists who ask, "What if I add a banana to 2?"

## TL;DR

- **Trust No One**: Every line of code is potentially a crime scene.
- **Defect Definition**: If it annoys the user, it is a bug. Even if "it works as designed."
- **Severity != Priority**: A server crash (High Severity) might be less important than a typo on the CEO's name (High
  Priority).
- **Context is King**: A bug in a pacemaker is different from a bug in a cat meme generator.

## Guilty Until Proven Innocent

The first rule of QA Club: **Every line of code is guilty.**

It assumes that every software application has defects embedded in it, waiting to strike like a raccoon in a bin.
Developers are blinded by the "Happy Path". They test that the login works with correct credentials. We test what
happens if you paste the entire script of *Shrek* into the password field.

## Severity vs Priority: The Cage Match

Understanding the difference between Severity and Priority is what separates the Lead QA from the person who just files
everything as "Critical".

- **Severity** (Technical): How much damage does the bug do?
  - *The server exploded.* -> **Critical Severity**.
  - *The logo is 1px off.* -> **Low Severity**.

- **Priority** (Business): How fast do we need to fix it?
  - *The logo is 1px off, but it is on the Super Bowl advert landing page.* -> **Critical Priority**.
  - *The server exploded, but it is the dev environment at 3 AM.* -> **Low Priority**.

You can have a **High Severity / Low Priority** bug (The application crashes on Windows 95).
You can have a **Low Severity / High Priority** bug (The CEO's name is spelled wrong on the homepage).

## Code Snippet: Tagging Priorities

We do not just prioritise bugs; we prioritise *tests*. You cannot run 5,000 E2E tests on every commit unless you have
infinite money. Use tags.

Here is how you tag tests in Playwright to separate the "Must Fix" from the "Nice to Fix":

```javascript
import { test, expect } from '@playwright/test';

// Critical Path: If this fails, STOP THE BUS.
test('User can checkout (Money In) [@critical]', async ({ page }) => {
  await page.goto('/cart');
  await page.click('#checkout');
  await expect(page).toHaveURL('/success');
});

// Minor Path: If this fails, we can still ship (probably).
test('Footer copyright year is current [@minor]', async ({ page }) => {
  await page.goto('/');
  const year = new Date().getFullYear();
  await expect(page.locator('footer')).toContainText(year.toString());
});
```

When the release is hot, run `npx playwright test --grep @critical`. When you have time (never), run them all.

## Summary

Software testing is not just about "breaking things"; it is about verifying reality. By understanding the difference
between Severity and Priority, and by embracing the inherent guilt of all code, you become not just a tester, but a
guardian of sanity.

## Key Takeaways

- **Differentiate**: Know the difference between a technical crash and a business emergency.
- **Advocate**: Fight for the user. If a bug frustrates them, it matters foundationally.
- **Tagging**: Categorise your tests. Not every test deserves to block a deployment.

## Next Steps

- **Audit**: Go look at your Jira backlog. Are the Priorities accurate, or is everything "High"?
- **Tag**: Add `[@critical]` to your top 5 most important automated tests today.
- **Floss**: Seriously, do it. Ideally every day.
