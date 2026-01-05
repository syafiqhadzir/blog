---
layout: post
title: 'Idempotency Testing for APIs: The Art of Hitting Retry Safely'
date: 2023-08-10
category: QA
slug: idempotency-testing-apis
gpgkey: EBE8 BD81 6838 1BAF
tags: ['backend-testing', 'philosophy']
description:
  'Explore the nuances of Idempotency Testing for APIs: The Art of Hitting Retry
  Safely. Networks are flaky. Wifi drops. Servers timeout.'
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Double Pizza Problem](#the-double-pizza-problem)
- [Testing the Idempotency Key](#testing-the-idempotency-key)
- [Code Snippet: API Test with Supertest](#code-snippet-api-test-with-supertest)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Networks are flaky. Wifi drops. Servers timeout.

When a client sends a request and does not get a response, it has two choices:

1. Give up (User is sad).
2. Retry (Server might process it twice).

If a payment API processes a retry as a second charge, you have just stolen
money. This is bad.

**Idempotency** is the mathematical property where `f(x) = f(f(x))`. Doing it
once is the same as doing it twice.

## TL;DR

- **Safe Methods are naturally idempotent**: `GET`, `PUT`, `DELETE` should
  naturally be idempotent.
- **Unsafe Methods need help**: `POST` is NOT idempotent by default. It needs
  help.
- **The Key enables deduplication**: Use a unique `Idempotency-Key` header to
  deduplicate requests.

## The Double Pizza Problem

Imagine you are ordering a pizza. You click "Buy". The loading spinner spins.
Nothing happens. You click "Buy" again.

Two hours later, two pizzas arrive. You are happy (more pizza), but your bank
account is sad.

In API design, we use an `Idempotency-Key`. The client generates a UUID
(`req-123`) and sends it with the request.

- **Request 1 (`req-123`)**: Server processes payment. Saves `req-123` as
  "Done". Returns 200 OK.
- **Request 2 (`req-123`)**: Server sees `req-123` is already "Done". Returns
  200 OK via Cache. **Does not charge card again.**

## Testing the Idempotency Key

Your job as QA is to be the annoying user who double-clicks everything.

1. **Call API** with Key `A`. Assert 201 Created. Check DB count = 1.
2. **Call API** with Key `A` (again). Assert 201 Created (or 200 OK). Check DB
   count = 1.
3. **Call API** with Key `B`. Assert 201 Created. Check DB count = 2.

If Step 2 creates a new record, fail the build immediately.

## Code Snippet: API Test with Supertest

Here is how to test this behaviour using `supertest` in Node.js.

```javascript
const request = require('supertest');
const { app, db } = require('./server');

describe('POST /payments (Idempotency)', () => {
  it('should not charge twice for the same Idempotency-Key', async () => {
    const key = 'uuid-555-666-777';
    const payload = { amount: 100, currency: 'GBP' };

    // 1. First Call
    const res1 = await request(app)
      .post('/payments')
      .set('Idempotency-Key', key)
      .send(payload);

    expect(res1.status).toBe(201);
    expect(res1.body.status).toBe('CHARGED');

    // 2. Second Call (The Retry)
    // We send the EXACT same key. The server should recognise it.
    const res2 = await request(app)
      .post('/payments')
      .set('Idempotency-Key', key)
      .send(payload);

    // 3. Assertions
    // Response should be identical (or 200 vs 201 depending on style)
    expect(res2.status).toBe(201);
    expect(res2.body.id).toBe(res1.body.id); // Same ID returned

    // Crucial: Check Database Side Effect
    const chargeCount = await db.payments.count({ key });
    expect(chargeCount).toBe(1); // Not 2!
  });
});
```

## Summary

Idempotency is the difference between a robust distributed system and a system
that accidentally double-bills customers every time AWS hiccups.

It requires client cooperation (sending the key) and server discipline (checking
the key).

## Key Takeaways

- **Cache Lifetime matters**: How long does the server remember the key? 24
  hours is standard.
- **Concurrency needs handling**: What if two requests with the same key arrive
  _at the exact same time_? (See Optimistic Locking).
- **Chaos reveals issues**: Use a proxy to intentionally drop the response
  packet to force the client to retry.

## Next Steps

- **Audit**: Check your `POST` endpoints. Do they support `Idempotency-Key`?
- **Standard**: Read the Stripe API documentation on idempotency; it is the gold
  standard.
- **Edge Cases**: Send the same Key but with a _different_ payload body. The
  server should reject this (400 Bad Request) (safety check).
