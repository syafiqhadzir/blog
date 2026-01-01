---
layout: post
title: 'CSP Testing: The Browser Bouncer'
date: 2024-08-29
category: QA
slug: csp-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Whitelisting Chaos](#whitelisting-chaos)
- [Report-Only Mode](#report-only-mode)
- [Code Snippet: Catching CSP Violations](#code-snippet-catching-csp-violations)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Content Security Policy (CSP) is a header that tells the browser: "Only load scripts from `mysite.com`. Anything else is a virus."

It kills XSS (Cross-Site Scripting) dead. But usually, it kills your own Google Analytics, your Chat Widget, and your unexpected fonts too.

QA must verify that the bouncer is not kicking out the VIP guests. CSP is the reason your perfectly valid JavaScript is suddenly throwing errors in the console.

## TL;DR

- **Strictness prevents bypass**: Avoid `unsafe-inline` and `unsafe-eval`. They defeat the purpose. If you see them, file a bug.
- **Integrity protects CDN assets**: Use Subresource Integrity (SRI) hashes for CDNs (`integrity="sha384-..."`).
- **Reporting reveals violations**: Ensure violations are sent to an endpoint (`report-uri`), not just printed in the console where nobody sees them.

## Whitelisting Chaos

"Dev: I added `ads.google.com` to the whitelist."
"QA: But the ad loads an iframe from `doubleclick.net`, which loads a pixel from `tracking.io`..."

CSP is a rabbit hole. You need to map the entire dependency tree of your third-party scripts. If you miss one, the ad is blank, revenue drops, and marketing yell at you.

**QA Strategy**: Click everything. If a script tries to load a resource from a new domain, the CSP will block it.

## Report-Only Mode

`Content-Security-Policy-Report-Only`.

This header logs violations but does not block them. Safe for Production? Yes. Useful for QA? No.

QA should test in **Blocking Mode** on Staging to see what actually breaks. If you test in Report-Only mode, you are just testing the logging, not the functionality.

## Code Snippet: Catching CSP Violations

You can listen for the `securitypolicyviolation` event in the browser, or catch console errors in Playwright.

```javascript
/*
  csp.spec.js
*/
const { test, expect } = require('@playwright/test');

test('should have no CSP violations', async ({ page }) => {
  const violations = [];
  
  // Method 1: Console sniffing (Easiest)
  page.on('console', msg => {
    if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
      violations.push(msg.text());
    }
  });

  // Method 2: Native Event Listener (Most Accurate)
  await page.exposeFunction('logViolation', (v) => violations.push(v));
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      window.logViolation(`Blocked: ${e.blockedURI} violated ${e.violatedDirective}`);
    });
  });

  await page.goto('/secure-page');
  
  // Interact to trigger dynamic scripts (e.g., open chat widget)
  await page.click('#open-chat');
  await page.waitForTimeout(1000);

  if (violations.length > 0) {
    console.error('CSP Violations Found:', violations);
  }
  
  expect(violations).toEqual([]);
});
```

## Summary

CSP is your last line of defence. It is annoying to configure.

But when a hacker tries to inject `<script>alert(1)</script>` into your comment section and the browser just ignores it, you will feel like a security god.

## Key Takeaways

- **Inline Styles are blocked by default**: `style="color: red;"` is blocked by default. Move it to a CSS class or use a nonce.
- **Nonce must be dynamic**: A cryptographic token used to allow specific inline scripts. Verify it changes on *every* reload. If it is static, it is useless.
- **JSON lives in headers**: CSP is sent as a Header, not in HTML. Check the Network tab, not the Source code.

## Next Steps

- **Tool**: Use **Google's CSP Evaluator**. It tells you if your policy is actually secure or just "Security Theatre" (trivial to bypass).
- **Learn**: Understand the difference between `script-src` (JS) and `connect-src` (AJAX/Fetch).
- **Audit**: Check your Production logs. Are you ignoring thousands of CSP reports? You probably are.
