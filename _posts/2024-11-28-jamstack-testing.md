---
layout: post
title: 'Jamstack Testing: It''s Just Static Files... Until It Isn''t'
date: 2024-11-28
category: QA
slug: jamstack-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:
- strategies
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Build Time" vs "Run Time" Trap](#the-build-time-vs-run-time-trap)
- [API Dependencies: The House of Cards](#api-dependencies-the-house-of-cards)
- [Code Snippet: Mocking API at Build Time](#code-snippet-mocking-api-at-build-time)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Jamstack. JavaScript, APIs, and Markup.

Ideally, it is pre-rendered HTML served from a CDN. Indestructible. You could unplug the backend, and the site would
still load (mostly).

In reality, your site calls 15 APIs (Contentful, Stripe, Algolia, Auth0) at runtime. If Algolia goes down, your search
bar is a decoration. If Stripe goes down, you cannot make money.

QA needs to verify the "A" in Jamstack, because "M" (Markup) rarely breaks, but "A" (API) breaks every Tuesday.

## TL;DR

- **Build Failures are Sev-1**: Treat a failed build as a Sev-1 bug. If you cannot deploy, you cannot fix a security
  patch.
- **Fallback behaviour matters**: If the API call fails, do we show a blank page or cached data? (Hint: Show stale data
  > Error page).
- **Auth needs verification**: You cannot hide API keys in the client bundle. Did you verify that your public keys are
  actually public-safe?

## The "Build Time" vs "Run Time" Trap

**Build Time**: Data fetched when you run `npm run build`. Stale but fast.
**Run Time**: Data fetched when the user visits. Fresh but risky.

**QA Strategy**:

1. **Verify Build Integrity**: Updates to the CMS should trigger a Webhook -> Build -> Deploy. Test this pipeline.
2. **Verify Runtime Resilience**: Block the API (DevTools -> Network -> Block URL) and refresh. Does the UI crash or
show a "Retry" button?

## API Dependencies: The House of Cards

Your site is a Frankenstein monster of services.

- Headless CMS (Content)
- Shopify (Products)
- Auth0 (Users)
- Lambda (Logic)

If *one* fails, what does the user see? Test with **Service Virtualisation**. Mock the failures. If Contentful returns a
500, does your Next.js `getStaticProps` retry? Or does it fail the build? (It should fail the build).

## Code Snippet: Mocking API at Build Time

If you use Next.js `getStaticProps`, you can mock the fetch for testing integrity without hitting real limits.

```javascript
/*
  next.config.js or setupTests.js
  Simulating API failures during build/test
*/

// Check if we are in a 'Chaos' test mode
if (process.env.CHAOS_MODE === 'true') {
  const originalFetch = global.fetch;
  
  global.fetch = async (url, options) => {
    // Simulate CMS outage
    if (url.includes('cdn.contentful.com')) {
      console.error('🔥 Simulating Contentful Outage');
       // Strategy 1: Return 500 (Should break build)
      return Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({})
      });
    }
    return originalFetch(url, options);
  };
}

test('should fail build if CMS is down', async () => {
    // This test expects the build script to exit with code 1
    // validating that we don't deploy an empty site.
    const { exitCode } = await executeBuildCommand({ env: { CHAOS_MODE: 'true'} });
    expect(exitCode).toBe(1);
});
```

## Summary

Jamstack is great for security (no server to hack) and speed (global CDN). But it pushes complexity to the edge.

Your QA tests must run at the edge too. Do not just test the UI; test the pipelines that build the UI.

## Key Takeaways

- **Atomic Deploys need verification**: Verify that a bad deploy does not break the live site. (Netlify/Vercel handles
  this well, but check your Database migrations—those are not atomic).
- **Preview URLs are your friend**: Every Pull Request gets a URL. Test *that* URL, not just localhost. It is the
  closest thing to production.
- **Incremental Builds affect timing**: If you change one typo, do we rebuild 10,000 pages? (ISR - Incremental Static
  Regeneration). Test the "regeneration" time.

## Next Steps

- **Tool**: Use **Mock Service Worker (MSW)** to intercept requests at the network level in the browser. It is magic.
- **Learn**: Read about **Edge Functions** (Cloudflare Workers). Logic running on the CDN. How do you test that locally?
  (Wrangler).
- **Audit**: Are you exposing your `STRIPE_SECRET_KEY` in the frontend bundle? Search your `main.js` for "sk_live_". You
  would be surprised.
