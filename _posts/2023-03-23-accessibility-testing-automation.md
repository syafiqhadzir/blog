---
layout: post
title: "Accessibility Testing Automation: It's Not Just for Lawyers"
date: 2023-03-23
category: QA
slug: accessibility-testing-automation
gpgkey: EBE8 BD81 6838 1BAF
tags: ['accessibility', 'automation', 'frontend-testing']
description:
  'Accessibility (a11y) is not an "optional feature" like Dark Mode or a generic
  Avatar. It is a human right. In many jurisdictions, it is also a legal
  requirement'
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Checkbox" Fallacy](#the-checkbox-fallacy)
- [Enter Axe-Core](#enter-axe-core)
- [Code Snippet: Playwright + Axe = Love](#code-snippet-playwright--axe--love)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Accessibility (a11y) is not an "optional feature" like Dark Mode or a generic
Avatar. It is a human right. In many jurisdictions, it is also a legal
requirement unless you enjoy giving money to lawyers.

Yet, manual accessibility auditing is tedious. The good news: you can automate
about 50% of it using the `axe-core` library. The bad news: automation cannot
gauge "usability" or "empathy," but it gets rid of the low-hanging fruit so you
can focus on the hard stuff.

## TL;DR

- **Automate the Basics**: Contrast, ARIA labels, semantic HTML.
- **Manual the Rest**: Screen reader flow, keyboard focus management.
- **Fail the Build**: Treat a11y violations like compilation errors.
- **Linting catches early issues**: Use `eslint-plugin-jsx-a11y` to catch issues
  before you even save the file.

## The "Checkbox" Fallacy

Many teams treat a11y as a final checkbox. "We'll build it, then we'll make it
accessible."

That is like saying, "We'll build the house, then we'll add the doors." It is
expensive, painful, and you end up cutting holes in load-bearing walls.

By integrating automated checks into your standard E2E or Component tests, you
ensure that every new button, form, and modal is accessible **by default**.

## Enter Axe-Core

Deque System's `axe-core` is the engine behind Google Lighthouse and most a11y
tools. It scans the DOM and reports violations based on WCAG 2.1 guidelines. It
is incredibly easy to inject into frameworks like Playwright, Cypress, or
Selenium.

## Code Snippet: Playwright + Axe = Love

Here is how to fail your Playwright test if your page is not accessible. We use
the `@axe-core/playwright` wrapper.

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('landing page should not have any accessibility violations', async ({
  page,
}) => {
  await page.goto('https://your-site.com/');

  // Scan the page (takes < 500ms)
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  // Report violations clearly
  if (results.violations.length > 0) {
    console.error(
      'Accessibility Violations:',
      JSON.stringify(results.violations, null, 2),
    );
  }

  // Fail the test if violations exist
  // Don't "expect(true).toBe(true)" here. Be harsh.
  expect(results.violations).toEqual([]);
});
```

When this test runs, it will scream at you if your button is just a `<div>` or
if your grey text is too light against the white background (Contrast Ratio <
4.5:1).

## Summary

Building accessible software is about empathy, but automation provides the
safety net. It catches the silly mistakes (missing IDs, bad nesting) so your
human auditors can focus on the complex interactions.

Automation does not replace manual testing; it enhances it.

## Key Takeaways

- **Keyboard First**: If you cannot use your site with only a Tab and Enter key,
  fail the test.
- **Zero Tolerance is required**: Do not allow "warnings". Fix them.
- **Alt Text needs description**: "Image" is not valid Alt Text. Describe the
  image.

## Next Steps

- **Install**: Add `@axe-core/playwright` (or `cypress-axe`) to your
  `package.json`.
- **Scan**: Run it on your Homepage. Cry at the number of errors.
- **Fix**: Dedicate one sprint to fixing the "Critical" and "Serious" issues.
