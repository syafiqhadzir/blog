---
layout: post
title: 'Payment Gateway Testing: Show Me The Money (Or The 402 Error)'
date: 2023-12-07
category: QA
slug: payment-gateway-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The High Stakes of Payments](#the-high-stakes-of-payments)
- [Test Cards: Magic Numbers](#test-cards-magic-numbers)
- [Code Snippet: Using Mock Stripe](#code-snippet-using-mock-stripe)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

There is no bug more terrifying than a Payment Bug.

If a button is misaligned, users laugh. If you charge a user £99 instead of £9, users sue.

Testing payment gateways (Stripe, PayPal, Adyen) is basically bomb defusal. You need to verify that money moves
correctly, without actually moving real money (unless you want to explain to your CFO why you spent £5,000 on "Test
Trainers").

## TL;DR

- **Sandbox is mandatory**: Always use the Sandbox environment.
- **Magic Numbers trigger behaviours**: Use specific credit card numbers to trigger specific errors (Decline,
  Insufficient Funds).
- **Webhooks need verification**: Verify that your backend handles the asynchronous "Payment Succeeded" callback.

## The High Stakes of Payments

Payments are not simple API calls. They are complex state machines.

1. User clicks "Pay".
2. Frontend sends card to Gateway (never to your server!).
3. Gateway returns a Token.
4. Backend sends Token + Amount to Gateway.
5. Gateway says "Processing...".
6. Gateway sends a Webhook 3 seconds later saying "Success".

If you miss step 6, you never ship the product, but you keep the money. That is called "fraud" (or at least "bad UX").

## Test Cards: Magic Numbers

Stripe provides a list of test cards that trigger specific behaviours.

- `4242...`: Success.
- `4000...`: Declined (Generic).
- `4000 0000 0000 0099`: Lost Card (Stolen).

You **must** write automated tests for the failure cases. What does your UI do when the card is declined? Does it show a
red box? Or does it spinner forever?

## Code Snippet: Using Mock Stripe

Instead of hitting the real Stripe API (even sandbox) in your CI, you should Mock it using a tool like `stripe-mock` or
Nock.

Here is a Node.js test using `nock` to simulate a declined charge.

```javascript
/* 
  paymentService.test.js
  Goal: Verify our app handles 'Card Declined' gracefully without hitting Stripe.
*/
const nock = require('nock');
const { chargeUser } = require('../services/payment');

describe('Payment Service', () => {
  it('handles card decline gracefully', async () => {
    // Intercept the request to Stripe
    nock('https://api.stripe.com')
      .post('/v1/charges')
      .reply(402, {
        error: {
          type: 'card_error',
          code: 'card_declined',
          message: 'Your card was declined.',
        }
      });

    // Attempt the charge
    const result = await chargeUser({ token: 'tok_chargeDeclined', amount: 9900 });

    // Verify our internal response
    expect(result.success).toBe(false);
    expect(result.error).toBe('Your card was declined.');
  });
});
```

## Summary

Handling money is stressful. But a robust suite of payment tests lets you sleep at night.

Remember: The only thing worse than a payment failing is a payment succeeding when it should not.

## Key Takeaways

- **Never touch the PAN**: Never, ever, ever log the 16-digit card number. PCI-DSS will hunt you down.
- **Idempotency keys prevent double-charging**: Use them. They prevent you from charging the user twice if the network
  flakes out.
- **Expiry Dates need testing**: Test what happens when a card expires *next month*.

## Next Steps

- **Refactor**: Ensure your Payment Logic is isolated in its own module.
- **Review**: Check your logs. Are there any credit card numbers? Delete them. NOW.
- **Automate**: Add a "Smoke Test" that runs against the Stripe Sandbox every morning.
