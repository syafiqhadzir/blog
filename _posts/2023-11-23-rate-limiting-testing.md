---
layout: post
title: 'Rate Limiting Testing: How to Tell Users to ''Calm Down'''
date: 2023-11-23
category: QA
slug: rate-limiting-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Bouncer of the API Club](#the-bouncer-of-the-api-club)
- [429: The Most Passive-Aggressive HTTP Status](#429-the-most-passive-aggressive-http-status)
- [Code Snippet: The Spam Bot](#code-snippet-the-spam-bot)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

If you offer a free API, someone will abuse it. It is a law of nature, like gravity or entropy.

To stop one user from crashing the server for everyone else, we use **Rate Limiting**.

It is the digital equivalent of a "One Per Customer" sign at an All-You-Can-Eat buffet. Testing it is fun because you
essentially get permission to DDoS your own staging environment.

## TL;DR

- **Thresholds need verification**: Know your limits (e.g., 100 requests/minute).
- **Headers need checking**: Check for `X-RateLimit-Remaining` and `Retry-After`.
- **Scope needs clarification**: Is the limit per IP, per User, or per API Key?

## The Bouncer of the API Club

A rate limiter sits at the front door (Gateway) and checks your ID.

- **Leaky Bucket**: Requests drip out at a steady rate. If you pour too fast, the bucket overflows.
- **Fixed Window**: "You have 100 requests between 12:00 and 12:01." (Reset at 12:01).
- **Sliding Window**: "You have 100 requests in the *last* 60 seconds." (Smoother, harder to implement).

**QA Challenge**: Verify that the limiter actually blocks the 101st request but allows the 1st request of the *next*
minute.

## 429: The Most Passive-Aggressive HTTP Status

When a user hits the limit, you should return `429 Too Many Requests`. But do not just say "No". Be helpful.

Return a `Retry-After` header telling them when they can come back.
*"Come back in 10 seconds, mate. You've had enough."*

If your API just hangs or returns a 500 error, you have a bug. The limiter should not crash the app; it should protect
it.

## Code Snippet: The Spam Bot

Here is a `k6` script designed to trigger a rate limit intentionally.

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  // Simulate 50 users spamming at once
  vus: 50,
  duration: '30s',
};

export default function () {
  const url = 'https://api.staging.example.com/v1/resource';
  const res = http.get(url);

  // Check if we hit the limit
  if (res.status === 429) {
    console.log(`⛔ Blocked! Retry-After: ${res.headers['Retry-After']}`);
  }

  check(res, {
    'is status 200 (allowed)': (r) => r.status === 200,
    'is status 429 (limited)': (r) => r.status === 429,
  });

  // Don't sleep. We WANT to spam.
  // sleep(1); 
}
```

## Summary

Rate limiting is the unsung hero of reliability. It prevents "Thundering Herds" and keeps your API responsive for the
99% of users who behave nicely.

Your job as QA is to be the 1% who behaves badly, just to check if the bouncer is awake.

## Key Takeaways

- **Test the Headers are accurate**: The headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`) are the contract. Verify
  they decrement correctly.
- **Bypass Strategy needs whitelisting**: Ensure your Load Balancers/WAF do not rate limit your *Monitoring Tools*.
  Whitelist Datadog, or you will get paged for a false alarm.
- **Distributed Limits need measurement**: If you have 3 servers, and the limit is 100, is it 100 *total* (using Redis)
  or 100 *per server* (300 total)? Measure this.

## Next Steps

- **Attack**: Run the k6 script against your Staging API.
- **Analyse**: Did the server CPU spike, or did the Gateway handle the rejection cheaply?
- **Observe**: Check your logs for "Rate Limit Exceeded" events.
