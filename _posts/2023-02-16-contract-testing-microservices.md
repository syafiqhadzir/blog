---
layout: post
title: 'Contract Testing for Microservices: Stop Breaking Your Neighbours'
date: 2023-02-16
category: QA
slug: contract-testing-microservices
gpgkey: EBE8 BD81 6838 1BAF
tags: ["contract-testing", "microservices", "backend-testing"]
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Microservices Headache](#the-microservices-headache)
- [Enter the Pact](#enter-the-pact)
- [Code Snippet: The Consumer Contract](#code-snippet-the-consumer-contract)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

In a microservices architecture, End-to-End (E2E) tests are the stuff of nightmares. They are slow, brittle, and require
the alignment of planets to pass.

"Why did the test fail?"
"Oh, the User Service is down."
"No, the Order Service changed its API schema from `userID` to `userId` and didn't tell anyone."

Contract Testing (via tools like Pact) is the polite handshake that solves this. It codifies expectations so services
can evolve independently without setting the house on fire.

## TL;DR

- **Consumer-Driven**: The Consumer (Frontend) tells the Provider (Backend) "I need this field," not the other way
  around.
- **Fast Feedback**: Verify integration in *unit test time*, not *deployment time*.
- **No Mocks (Sort of)**: You test against a contract, not a hardcoded mock that lies to you.
- **Deploy Safely**: If the contract passes, you can deploy Service A without even checking if Service B is awake.

## The Microservices Headache

Traditionally, to test if Service A can talk to Service B, you deploy both to a staging environment and run an HTTP
request.

1. It is slow.
2. Debugging is hard.
3. Version mismatch (Dev version vs Staging version).

Contract Testing replaces this with **Stub Files**. The Consumer generates a contract (JSON) saying "I expect `GET
/user/1` to return `{ id: 1 }`". The Provider takes that JSON and verifies "Yes, I can fulfil that."

## Enter the Pact

Pact is the industry standard for this. It works on a simple premise:

1. **Consumer** defines the contract in a test.
2. **Pact** generates a `.json` file (the Pact).
3. **Provider** replays requests from that file against itself to verify it complies.

## Code Snippet: The Consumer Contract

Here is a simplified example of a Consumer (e.g., a React App) defining expectations for a Provider (User API) using
Pact JS.

```javascript
import { Pact } from '@pact-foundation/pact';

const provider = new Pact({
  consumer: 'MyFrontendApp',
  provider: 'UserAPIService',
  port: 1234,
});

describe('User API Contract', () => {
  // Start the Mock Server
  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());

  test('returns a user object', async () => {
    // 1. Define expectations (The Contract)
    await provider.addInteraction({
      state: 'a user exists',
      uponReceiving: 'a request for user 1',
      withRequest: {
        method: 'GET',
        path: '/users/1',
      },
      willRespondWith: {
        status: 200,
        body: {
          id: 1,
          name: 'Alice', // We strictly enforce this schema
        },
      },
    });

    // 2. Execute the actual call within your app
    // The app hits localhost:1234, believing it's the real API
    const response = await fetchUser(1);
    
    // 3. Verify logic
    expect(response.id).toBe(1);
  });
});
```

If the Provider (User API) later changes `name` to `fullName`, their own build will fail when verifying this contract.
You catch the break *before* it merges.

## Summary

Microservices are about autonomy, but autonomy without rules is anarchy. Contract testing provides the guardrails that
allow teams to move fast without breaking their neighbours.

It turns integration testing from a "Big Bang" event at the end of the sprint into a continuous, lightweight check.

## Key Takeaways

- **Can I Deploy?**: Use the Pact Broker's "Can I Deploy" tool. It answers the question better than any manager can.
- **Evolution is safe**: Providers can change *internal* logic safely, as long as the *external* contract is met.
- **Communication is the contract**: The Contract *is* the documentation.

## Next Steps

- **Pick a Pair**: Choose one Consumer (e.g., Frontend) and one Provider (e.g., Backend).
- **Write One Test**: Define one simple interaction (e.g., Get Health Check).
- **Set up a Broker**: You need a place to store these JSON files. Use a free hosted Pact Broker or spin up the Docker
  image.
