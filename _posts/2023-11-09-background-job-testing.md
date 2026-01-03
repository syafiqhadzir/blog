---
layout: post
title: 'Background Job Testing: The Invisible Workhorses'
date: 2023-11-09
category: QA
slug: background-job-testing
gpgkey: EBE8 BD81 6838 1BAF
tags: ["qa-general"]
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Fire and Forget (And Pray)](#fire-and-forget-and-pray)
- [The Three Phases of Async Testing](#the-three-phases-of-async-testing)
- [Code Snippet: Testing the Worker](#code-snippet-testing-the-worker)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

In the world of web development, anything that takes longer than 500ms is a "Background Job". Sending emails, resizing
images, mining crypto on your users' CPUs (joking... mostly).

Developers love "Fire and Forget". QA Engineers know that "Forget" usually means "It silently failed, and we found out
three months later when the CEO tried to reset his password."

## TL;DR

- **Enqueueing needs verification**: Verify the job was actually sent to the queue.
- **Execution needs verification**: Verify the job performs the task (e.g., sends email) when processed.
- **Dead Letter Queue (DLQ) needs testing**: Verify what happens when the job fails 5 times. Does it retry or die?

## Fire and Forget (And Pray)

The problem with async jobs is that the HTTP response is usually `202 Accepted`. This just means "I promise to do this
later."

Promises, as my ex will tell you, are often broken.

Testing background jobs requires a mindset shift. You cannot just assert the response code. You have to peek behind the
curtain and check the queue, the database side-effects, and the external API calls.

## The Three Phases of Async Testing

1. **The Trigger**: Does clicking "Sign Up" actually queue the `WelcomeEmailJob`? (Mock the queue).
2. **The Work**: Does running `WelcomeEmailJob` actually send an email? (Mock the email provider).
3. **The Retries**: If the Email Service is down, does the job retry exponentially, or does it crash and burn?

## Code Snippet: Testing the Worker

Here is a typical test case using a mock for an Email Worker (JavaScript/Jest style).

```javascript
/* 
  emailWorker.test.js 
  Goal: Verify the worker logic isolated from the Queue Infrastructure.
*/
const emailWorker = require('../workers/emailWorker');
const emailProvider = require('../lib/sendgrid');

// Mock the external provider so we don't spam real people
jest.mock('../lib/sendgrid');

describe('Email Worker', () => {
  const jobPayload = { userId: 123, email: 'qa@example.com' };

  it('sends an email when processed', async () => {
    // 1. Execute the worker function directly (Unit Test)
    await emailWorker.process(jobPayload);

    // 2. Verify the side-effect (Email Provider was called)
    expect(emailProvider.send).toHaveBeenCalledWith({
      to: 'qa@example.com',
      subject: 'Welcome!',
      body: expect.stringContaining('Thanks for signing up')
    });
  });

  it('throws an error if external provider fails (triggering a retry)', async () => {
    // 1. Mock a failure from the 3rd party
    emailProvider.send.mockRejectedValue(new Error('API Down'));

    // 2. Assert the bubble-up ensures the Queue System sees the failure
    await expect(emailWorker.process(jobPayload)).rejects.toThrow('API Down');
    
    // Note: The Queue System (e.g. Bull/Sidekiq) is responsible for the Retry logic,
    // so we just need to verify we bubble the error up.
  });
});
```

## Summary

Background jobs are the plumbing of your application. Nobody notices them until the toilets back up.

By testing the enqueueing, execution, and failure modes, you make sure that "Async" does not mean "Abyss".

## Key Takeaways

- **Idempotency prevents double-charging**: Ensure that running the job twice does not charge the customer twice.
  (Queues sometimes deliver double messages).
- **Observability catches silent failures**: If a job dies in the forest (queue) and no one logs it, did it make a
  sound?
- **Integration tests need polling**: At least one E2E test should wait for the job to complete (use polling).

## Next Steps

- **Audit**: List all background jobs in your codebase.
- **Check DLQ**: Go look at your Dead Letter Queue. Is it full of valid jobs from 2021?
- **Add Tests**: Write a unit test for your most critical worker today.
