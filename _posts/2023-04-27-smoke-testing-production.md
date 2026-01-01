---
layout: post
title: 'Smoke Testing in Production: Living Dangerously'
date: 2023-04-27
category: QA
slug: smoke-testing-production
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Why "It Works in Staging" is a Lie](#why-it-works-in-staging-is-a-lie)
- [Safe Smoke Strategy](#safe-smoke-strategy)
- [Code Snippet: The Synthetic User](#code-snippet-the-synthetic-user)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

"I don't always test my code, but when I do, I do it in production." The old meme is funny because it is terrifying.

But in the era of Microservices and Continuous Delivery, **Testing in Production (TiP)** is not recklessness; it is a necessity. Staging environments are like a staged house: they look nice, but the plumbing probably does not work because no one has flushed the toilet in six weeks. Production is where real life happens.

## TL;DR

- **Read-Only is safest**: Run tests that check connectivity but do not delete data (GET requests).
- **Test Accounts isolate impact**: Use a dedicated user (e.g., `smoke_test_user@company.com`) that is filtered out of analytics.
- **Observability reveals issues**: Monitor error rates immediately after deployment.
- **Headers suppress side effects**: Use `X-Test-Traffic: true` to suppress emails.

## Why "It Works in Staging" is a Lie

Because "It worked on my machine" is not a legal defence.

Staging environments drift. Data is stale. Configuration is slightly different (e.g., Staging uses a mocked Payment Gateway, Prod uses Real Stripe). The only way to know *for sure* if the `Checkout` button works for Mrs. Jones in Wales is to actually check it on the live infrastructure (preferably without charging Mrs. Jones's credit card).

A **Smoke Test** is a quick sanity check (5-10 minutes) that verifies the critical paths:

1. Can I login?
2. Can I search for "shoes"?
3. Is the API returning 200 OK?

## Safe Smoke Strategy

You do not want to accidentally email 50,000 users "Hello World".

1. **Isolation**: Use specific headers (`X-Test-Request: true`) to tell downstream services to mute notifications.
2. **Teardown**: If you create data (like an Order), ensure your script cancels/deletes it immediately.
3. **Scheduling**: Run these tests every 5 minutes, 24/7. This is called **Synthetic Monitoring**.

## Code Snippet: The Synthetic User

Here is a Playwright script designed to run against Production. It uses specific "Test User" credentials stored in secrets.

```typescript
import { test, expect } from '@playwright/test';

// Safety Check: We actually want to run this in PROD
const IS_PROD = process.env.ENV === 'PROD';

test('Critical Path: Login and View Dashboard', async ({ page }) => {
  if (!IS_PROD) console.log('Warning: Running against non-prod');

  // 1. Navigate to the REAL site
  await page.goto('https://www.my-saas-app.com/login');

  // 2. Login with dedicated test account
  // This user should have a "Test" flag in the DB to avoid skewing analytics
  await page.fill('#email', process.env.PROD_TEST_USER);
  await page.fill('#password', process.env.PROD_TEST_PASS);
  await page.click('button[type="submit"]');

  // 3. Verify successful redirect (or 2FA challenge)
  await expect(page).toHaveURL(/dashboard/);
  
  // 4. Check for critical element
  // If this fails, the site is effectively down.
  const balance = await page.locator('.account-balance').innerText();
  console.log(`Current Balance: ${balance}`); 
});
```

If this test fails, it should trigger a **P1 incident** via PagerDuty and wake up the on-call engineer. It means your shop is closed, even if the server status page says "System Operational" (it lies).

## Summary

Production is the only environment that truly matters. By cautiously testing in the wild, we bridge the gap between "theory" and "practice".

Do not fear production; respect it. And maybe do not run `DROP TABLE` scripts there.

## Key Takeaways

- **Monitoring is not Testing**: Monitoring tells you the CPU usage. Testing tells you if the user can buy a hat.
- **Rollback needs automation**: If the smoke test fails post-deploy, auto-revert the version.
- **Analytics need filtering**: Filter out your test user's data so you do not mess up the Marketing KPIs.

## Next Steps

- **Create User**: Make a dedicated test account in Prod today. Call it `synthetic_monitor`.
- **Script It**: Write a 10-line script that logs in.
- **Schedule It**: Put it in a GitHub Action cron job running every 15 minutes.
