---
layout: post
title: 'Year-End Automation Audit: Marie Kondo Your Tests'
date: 2024-12-26
category: QA
slug: year-end-automation-audit
gpgkey: EBE8 BD81 6838 1BAF
tags: ["automation"]
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Zombie Tests](#the-zombie-tests)
- [Flaky Test Bankruptcy](#flaky-test-bankruptcy)
- [Code Snippet: Finding Unused Tests](#code-snippet-finding-unused-tests)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

It is December. The code freeze is coming. The office is empty.

You have 500 automated tests. 30 of them are "quarantined" (`test.skip`). 50 of them have not failed in 2 years (Are
they asserting anything?). 10 of them fail every Tuesday because the staging database resets.

It is time to clean house. Does this test spark joy? No? Delete it.

## TL;DR

- **Delete ruthlessly**: If a test has not caught a bug in a year, and the feature rarely changes, it is dead weight.
  Delete it.
- **Refactor aggressively**: Merge 5 small UI tests (Login, Header, Footer) into 1 comprehensive flow. Remove the
  setup/teardown overhead.
- **Upgrade dependencies**: Upgrade your dependencies (Node, Playwright, Chromium). Free speed boost.

## The Zombie Tests

A test that always passes is suspicious.

Maybe the assertion is `expect(true).toBe(true)`. Maybe the element it looks for is gone, but the test does not check
visibility, just presence in DOM.

Audit the "Always Green" tests. **The "Red" Test**: Intentionally break the login button. Run the suite. If the Login
Test still passes, you have a Zombie. Shoot it.

## Flaky Test Bankruptcy

If a test is flaky, you ignore it. If you ignore it, it has zero value. It actually has *negative* value because it
wastes CI minutes and developer trust.

Declare **Bankruptcy**. Delete (or `@skip`) ALL flaky tests. Rewrite them from scratch ONLY if they are business
critical (e.g., Checkout). Spoiler: You usually will not miss 90% of them.

## Code Snippet: Finding Unused Tests

A conceptual script to match test files against git commit history. "If this test file was not touched in 12 months,
does it spark joy?"

```bash
#!/bin/bash
# audit-tests.sh

echo "🧹 Starting Year-End Cleaning..."

# 1. Find stale tests (Not modified in 1 year)
echo "--------------------------------"
echo "🧟 Zombie Tests (Stale > 365 days):"
find ./tests -name "*.spec.ts" -mtime +365 -print

# 2. Count skipped tests
echo "--------------------------------"
echo "🙈 Skipped Tests (Technical Debt):"
grep -r ".skip" ./tests | wc -l

# 3. Find 'FIXME' comments
echo "--------------------------------"
echo "🛠️ FIXMEs:"
grep -r "FIXME" ./tests | wc -l

# 4. Find tests with no assertions (Basic check)
# Matches 'test(' blocks that don't contain 'expect('
# (This is a naive regex, but useful for spotting empty shells)
echo "--------------------------------"
echo "⚠️  Suspiciously Empty Tests:"
grep -r "test(" ./tests | grep -v "expect("
```

## Summary

Automation is code. Code rots. Maintenance is the price of admission.

Do not carry 2024's rubbish into 2025. Start fresh. Start clean. Your goal is not "More Tests". Your goal is "More
Confidence". Sometimes, fewer tests give more confidence.

## Key Takeaways

- **Coverage is a vanity metric**: High coverage % means nothing. Focus on "Risk Coverage". Do we cover the Payment
  flow? Good. Do we cover the "About Us" footer link? Who cares.
- **Tooling deserves review**: Is it time to switch from Selenium/Java to Playwright/TS? The holidays are a great time
  for a POC (Proof of Concept).
- **Documentation needs updating**: Update your `README.md`. It definitely says "Run `npm install`" but requires `pnpm`
  now.

## Next Steps

- **Tool**: Use **Knip** to find unused exports and files in your project. It is aggressive and effective.
- **Learn**: Read about **Test Impact Analysis**. Only run tests relevant to the changed code (Jest has this built-in).
- **Audit**: Check your CI bill. Are you spending £1,000/month running tests on every commit that nobody looks at? Move
  them to Nightly.
