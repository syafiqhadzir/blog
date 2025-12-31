---
layout: post
title: "SSO Testing Patterns: One Password to Rule Them All"
date: 2024-09-12
category: QA
slug: sso-testing-patterns
gpgkey: "EBE8 BD81 6838 1BAF"
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The SAML Nightmare](#the-saml-nightmare)
- [OIDC: The Cool Kid](#oidc-the-cool-kid)
- [Code Snippet: Decoding ID Tokens](#code-snippet-decoding-id-tokens)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Single Sign-On (SSO) is great. You log in to Google, and suddenly you are logged in to Slack, Jira, Zoom, and the coffee machine.

But when it fails, you are locked out of your entire digital life.

Testing SSO is about verifying trust chains and ensuring that the handshake between "App A" and "Identity Provider B" does not turn into a slap in the face. "Does App A trust Identity Provider B enough to let User C in?"

## TL;DR

- **Relay State preserves context**: Ensure the user lands on the correct page after the SSO redirect loop. Deep linking is the first victim of SSO.
- **Logout is harder than Login**: Single Sign-**Out** is harder than Sign-In. Does logging out of the App log you out of the IDP? (Usually no, and that is confusing).
- **JIT Provisioning creates accounts**: Just-In-Time. Does a new user get an account created automatically upon first login? Or do they get a 404?

## The SAML Nightmare

SAML (Security Assertion Markup Language) is XML-based. It is old, verbose, enterprise-y, and breaks if your server clock is off by 5 seconds.

**QA Strategy**:

- **XML Signature must be verified**: Is it tamper-proof? If I change the implementation role from `user` to `admin` in the XML, does the server accept it? (It should not).
- **Certificates expire**: Did the Ops team forget to renew the signing cert? (Yes, they did).
- **Time Skew breaks things**: `NotBefore` and `NotOnOrAfter` conditions.

## OIDC: The Cool Kid

OpenID Connect (OIDC) is built on OAuth2 and uses JSON (JWT). It is lighter, friendlier, and easier to debug because you can actually read it.

But it introduces the "ID Token". QA must verify this token contains the correct Email, Name, and mapped Roles.

If the IDP sends `role: ["Engineering"]` but your app expects `group: ["Engineering"]`, the login succeeds but the user sees nothing.

## Code Snippet: Decoding ID Tokens

Do not just look at the token string. Decode it and verify the claims.

```javascript
/*
  sso.spec.js
*/
const jwt = require('jsonwebtoken'); // You'll need this library
const { test, expect } = require('@playwright/test');

test('should validate OIDC ID Token claims', async ({ page }) => {
  // Perform SSO Login
  await page.goto('/login');
  await page.click('.sso-btn'); // "Login with Okta"
  
  // Handshake happens...
  await page.waitForTimeout(2000); 

  // Capture the ID Token from LocalStorage (or Cookie)
  const idToken = await page.evaluate(() => localStorage.getItem('id_token'));
  
  if (!idToken) throw new Error("ID Token not found in storage");

  // Decode (Verify signature in a real backend test, but decode here for claims)
  const decoded = jwt.decode(idToken);

  console.log('User Claims:', decoded);

  // Assertions
  expect(decoded.email).toBe('testuser@company.com');
  expect(decoded.iss).toContain('accounts.google.com'); // Issuer check
  
  // Check Expiry (Critical)
  const now = Math.floor(Date.now() / 1000);
  expect(decoded.exp).toBeGreaterThan(now);
});
```

## Summary

SSO is the bouncer that checks ID cards. If the bouncer is drunk (buggy), either nobody gets in, or *everybody* gets in.

Both are bad. But "everybody getting in" gets you on the front page of Hacker News.

## Key Takeaways

- **Deep Linking needs testing**: Click a link in an email -> SSO Login -> Redirect. Does it go to the email link, or default to the Dashboard?
- **MFA requires automation handling**: If SSO requires 2FA, does your automation handle it? (Hint: Use TOTP generator libraries for MFA seeds).
- **Guest Access provides fallback**: Can a user *bypass* SSO if the IDP is down? (Break-glass accounts). Ensure these are monitored.

## Next Steps

- **Tool**: Use **SAML Tracer** browser extension to see the raw XML exchange. It saves lives.
- **Learn**: Read about **SCIM** (System for Cross-domain Identity Management). It automates user creation/deletion so you do not have to manually invite people.
- **Audit**: Check if you accept unsigned SAML requests. That is a massive security hole.
