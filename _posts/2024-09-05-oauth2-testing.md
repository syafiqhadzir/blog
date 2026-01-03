---
layout: post
title: 'OAuth2 Testing: The Dance of the Tokens'
date: 2024-09-05
category: QA
slug: oauth2-testing
gpgkey: EBE8 BD81 6838 1BAF
tags: ['authentication', 'security']
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Access vs Refresh Tokens](#access-vs-refresh-tokens)
- [The "Lost State" Redirect](#the-lost-state-redirect)
- [Code Snippet: Intercepting Token Refresh](#code-snippet-intercepting-token-refresh)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

"Login with Google". "Login with Facebook".

It looks simple. A button click, a popup, and you are in. Under the hood, it is
a terrifying relay race of Redirects, Authorisation Codes, Access Tokens, and
Client Secrets.

If any runner drops the baton, the user is locked out. QA must test the "Edge
Cases of Auth" because developers usually just test the "Happy Path" where the
token never expires.

## TL;DR

- **Expiry breaks sessions**: Access Tokens die (usually 1 hour). Does the app
  silently refresh it? Or does it crash?
- **Scope limits access**: If I only granted "Read Profile", does the app
  explode when it tries to "Post Tweet"?
- **State prevents CSRF**: The `state` parameter prevents CSRF (Cross-Site
  Request Forgery). Ensure it is validated, or you have a security hole.

## Access vs Refresh Tokens

**Access Token**: The key to the hotel room. Valid for 1 hour. Cheap, fast,
disposable. **Refresh Token**: The ID card to get a new key at front desk. Valid
for 30 days. Secure, powerful.

**QA Test**:

1. Log in.
2. Open DevTools -> LocalStorage/Cookies.
3. Manually delete (or mangle) the **Access Token**.
4. Reload page (or click a button).
5. **Pass**: App uses Refresh Token to get a new Access Token seamlessly. User
   notices nothing.
6. **Fail**: App redirects to Login screen (Disruptive) or crashes
   (Embarrassing).

## The "Lost State" Redirect

User clicks "Login" whilst on the Checkout page with a basket full of items.
They go to Google. They authorise. They come back to... the Homepage? With an
empty basket?

**FAIL**.

They should go back to the _page they were on_ (Checkout). This requires storing
the "Return URL" (often in the `state` param or local storage) before the
redirect dance begins. Test this. It breaks constantly.

## Code Snippet: Intercepting Token Refresh

Simulate a token expiry to verify your frontend handles 401 Unauthorised
responses correctly (by refreshing the token and retrying).

```javascript
/*
  oauth.spec.js
*/
const { test, expect } = require('@playwright/test');

test('should auto-refresh token and retry on 401', async ({ page }) => {
  await page.goto('/dashboard');

  // Spy on the refresh request to verify it happens
  const refreshRequest = page.waitForRequest((req) =>
    req.url().includes('/oauth/token'),
  );

  // Mock the next API call to return 401 (Unauthorised)
  // This simulates an expired Access Token
  await page.route('/api/user/profile', (route) => {
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'token_expired' }),
    });
  });

  // Trigger the API call
  await page.click('#load-profile');

  // 1. Verify App attempted to refresh
  await refreshRequest;

  // 2. Mock the RETRY of the original request (which should happen after refresh)
  // We need to unroute or update the route to return 200 now
  await page.unroute('/api/user/profile');

  // Verify the UI eventually succeeds
  await expect(page.locator('.profile-name')).toBeVisible();
});
```

## Summary

Auth bugs are Critical bugs. You cannot "Patch it later".

If Auth is broken, nobody can use your features. You have zero users. Test the
sadness of expiring tokens. Test the darkness of revoked permissions.

## Key Takeaways

- **Revocation must be immediate**: If the user clicks "Log out of all devices"
  in their account settings, does the Refresh Token stop working effectively
  immediately?
- **PKCE is mandatory for SPAs**: For mobile/SPA, ensure PKCE (Proof Key for
  Code Exchange) is used. It is more secure than the implicit flow.
- **Errors need graceful handling**: Handle `access_denied` (User clicked Cancel
  on the Google consent screen). Do not show a 500 error stack trace. Show
  "Login Cancelled".

## Next Steps

- **Tool**: Use **OAuth.tools** playground to understand the flows visually. It
  is fantastic.
- **Learn**: Read RFC 6749. Just kidding, read a blog summary of it.
- **Audit**: Check if you are storing tokens in LocalStorage (vulnerable to
  XSS). **HttpOnly Cookies** are safer.
