---
layout: post
title: "QA Engineers for SEO: Guarding the Invisible Door"
date: 2022-11-10
category: QA
slug: qa-engineers-for-seo
gpgkey: "EBE8 BD81 6838 1BAF"
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Odd Couple: QA and SEO](#the-odd-couple-qa-and-seo)
- [Technical SEO: Where We Come In](#technical-seo-where-we-come-in)
- [Code Snippet: Automating the Basics](#code-snippet-automating-the-basics)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Search Engine Optimisation (SEO) and Quality Assurance (QA) usually sit at opposite ends of the office cafeteria. One group talks about "keywords" and "backlinks" and magical Google algorithms; the other mutters about "regressions" and "null pointers" and why the staging environment is down again.

But here is the secret: good SEO is primarily about good technical quality. If your website is a slow, broken mess, all the keywords in the world will not save you. And who owns quality? We do. We are the gatekeepers of the invisible door that the Googlebot walks through.

## TL;DR

- **Google hates bugs**: A 500 error is the fastest way to lose ranking.
- **Speed is quality**: Core Web Vitals are just performance tests with a fancy marketing name.
- **Do not replace the SEO Analyst**: You validate the requirements; they gaze into the crystal ball.
- **Automation is mandatory**: Manually checking `meta` tags is a punishment, not a job.

## The Odd Couple: QA and SEO

You might think SEO is just "marketing magic". And yes, there is a lot of wizardry involved in keyword research. But once the SEO analyst hands down the requirement—"This page needs a canonical tag pointing to X"—it becomes a technical requirement.

A developer refactoring the header might accidentally delete the `meta description` tag. To them, the site looks identical. To Google, the site just lobotomised itself.

We do not need to understand the algorithm updates (which change faster than a JavaScript framework anyway). We just need to understand that **broken code = invisible website**.

## Technical SEO: Where We Come In

Here is where the overlap happens. These are not "marketing" issues; they are bugs.

1. **Meta Tags**: If the `title` tag says "React App", we have failed.
2. **Performance**: Core Web Vitals (LCP, CLS, INP) are ranking factors. If the site takes 10 seconds to load, the user leaves, and Google notices.
3. **Broken Links**: 404s leak "link juice" (yes, that is a real term) and frustrate users.
4. **Canonical Links**: Ensuring we are not competing with ourselves for Google's attention.

## Code Snippet: Automating the Basics

Manually checking `meta` tags is the definition of insanity. Let us write a simple Playwright test to ensure we do not accidentally nuke our SEO hygiene.

```typescript
import { test, expect } from '@playwright/test';

test('SEO Essentials: Homepage should not be invisible', async ({ page }) => {
  await page.goto('/');

  // 1. Title Check
  // A generic title is a missed opportunity.
  await expect(page).toHaveTitle(/My Awesome Product | Best Widgets/);

  // 2. Meta Description
  // This is what users see in search results. Don't leave it empty!
  const metaDescription = page.locator('meta[name="description"]');
  await expect(metaDescription).toHaveAttribute('content', /.+/); // Not empty

  // 3. Canonical Tag
  // Prevent duplicate content penalties.
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute('href', 'https://www.mywebsite.com/');

  // 4. H1 Hierarchy
  // There should be exactly one H1, because Highlander rules apply.
  await expect(page.locator('h1')).toHaveCount(1);
});
```

This simple script prevents a catastrophic deployment where the homepage title reverts to "Undefined". It runs in CI, it never complains, and it keeps the Marketing team from crying.

## Summary

SEO is nuanced and takes a tremendous amount of time. But ensuring the *technical foundation* is solid? That is pure QA.

We are the safety net. If we do our job right, the SEO analysts can focus on their keyword wizardry without worrying that the website is throwing 404s behind their backs.

## Key Takeaways

- **Technical SEO is QA**: Redirects, status codes, and tags are testable requirements.
- **Performance is SEO**: If it is slow, it is ranking low.
- **Automation is essential**: Never manually check 100 pages for title tags. Script it.
- **Collaboration**: Ask your SEO analyst for a "Testing Guide" (not a checklist) and automate it.

## Next Steps

- **Run Lighthouse**: Run a Lighthouse audit on your staging environment today. It is built into Chrome.
- **Check Robots.txt**: Verify you are not accidentally blocking Google in production (`Disallow: /`). It happens more often than you think.
- **Add a Test**: Copy the code above and add it to your E2E suite.
