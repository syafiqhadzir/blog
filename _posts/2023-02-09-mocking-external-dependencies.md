---
layout: post
title: 'Mocking External Dependencies: The Lie We Tell Ourselves'
date: 2023-02-09
category: QA
slug: mocking-external-dependencies
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
---## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Mocking Trap](#the-mocking-trap)
- [Method vs Network Mocking](#method-vs-network-mocking)
- [Code Snippet: Mocking with MSW](#code-snippet-mocking-with-msw)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Relying on live external APIs (like Stripe, Twilio, or Google Maps) in your test suite is a recipe for disaster. It introduces non-determinism (flakiness), costs money (API credits), and slows your suite to a crawl.

But mocking is like Method Acting: if you get too into character, you forget what real life is like. You end up with a suite of green tests and a production environment that crashes because Stripe renamed a field from `amount` to `total`.

## TL;DR

- **Do not Mock Libraries**: Mock the network traffic, not the SDK method.
- **Contract Tests ensure accuracy**: Ensure your mocks match reality.
- **Flakiness is real**: Real APIs fail. Your mocks should occasionally throw 500 errors to test your error handling.
- **Speed is the benefit**: Mocks are fast. Real APIs are slow.

## The Mocking Trap

The classic mistake is "Over-Mocking".

You write a test that checks if `PaymentService.charge()` returns `true`. Inside `PaymentService`, you spy on the Stripe library and tell it to return `{ status: 'success' }`.

Congratulations. You have tested nothing. You have verified that your mock returns what you told it to return. This is a tautology, not a test.

## Method vs Network Mocking

Instead of mocking the library method (`stripe.charges.create`), mock the HTTP traffic.

Tools like **MSW (Mock Service Worker)** intercept the outgoing request at the network layer. This means your application code runs *exactly as it would in production*, using the real Stripe SDK, believing it is talking to the real internet.

## Code Snippet: Mocking with MSW

Here is how to set up a safe mock using MSW. We define a handler that intercepts calls to `https://api.stripe.com`.

```javascript
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { chargeCard } from './paymentService';

// 1. Define the Mock Network Handler
// We capture the POST request to Stripe's API
const server = setupServer(
  rest.post('https://api.stripe.com/v1/charges', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ id: 'ch_123', status: 'succeeded' })
    );
  })
);

// 2. Lifecycle Management (Start intercepting)
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// 3. The Test
test('charges card successfully', async () => {
  // The service uses the REAL network stack
  const result = await chargeCard('tok_visa', 100);
  expect(result.status).toBe('succeeded');
});
```

This is robust. If your `chargeCard` function changes how it builds the URL or headers, MSW will catch it (or return a 404), whereas a method spy would blindly pass.

## Summary

Mocks are a bridge, not the destination. They allow us to travel fast during development, but we must occasionally check the map (real API integration).

By mocking at the network layer and syncing with contracts, we get the speed of unit tests with the confidence of integration tests. And we stop lying to ourselves about whether the code actually works.

## Key Takeaways

- **Mock Boundaries correctly**: Mock the HTTP layer, not the internal functions.
- **Simulate Failure**: Write a test where the mock returns 429 (Rate Limit). Does your app retry or crash?
- **Update Mocks regularly**: When the API provider updates their version, update your mocks immediately.

## Next Steps

- **Audit**: Search for `jest.spyOn` in your codebase. Replace it with MSW.
- **Chaos**: Add a test case for "Network Timeout".
- **Contract**: Check if you are using the latest API version in your mocks.
