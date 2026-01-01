---
layout: post
title: 'Event-Driven Architecture Testing: Chaos in the Queue'
date: 2023-06-29
category: QA
slug: event-driven-architecture-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- architecture
- qa
- testing
---## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Silence of the Logs](#the-silence-of-the-logs)
- [Idempotency: The Duplicate Nightmare](#idempotency-the-duplicate-nightmare)
- [Code Snippet: Testing Async Events](#code-snippet-testing-async-events)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

In the old days (REST APIs), you sent a request, and the server replied "200 OK" or "500 ERROR". It was polite. It was synchronous. It was like a phone call.

**Event-Driven Architecture (EDA)** is like a WhatsApp group chat. You send a message (Event) into the void (Kafka/RabbitMQ), and maybe someone reads it. Maybe they do not. Maybe they read it three times. Maybe they reply next Tuesday.

Testing this chaos requires a mindset shift from "Input -> Output" to "Input -> ...wait for it... -> Effect".

## TL;DR

- **Eventual Consistency requires patience**: Your test cannot expect immediate results; it must poll or wait.
- **Idempotency prevents duplicates**: Verify that processing the same event twice does not charge the customer twice.
- **Tracing enables debugging**: If you do not use `correlation_id`, you are flying blind.
- **Dead Letter Queues (DLQ) need monitoring**: Where do bad messages go to die? Verify they do not block the good ones.

## The Silence of the Logs

The hardest part of testing EDA is observability. If Service A publishes `OrderCreated` and Service B fails to process it, Service A is still happy. It successfully published the message. The error is hidden in Service B's logs (or worse, the message just vanished into the ether).

To test this, you need **Distributed Tracing**. Every event must have a `trace_id` (correlation ID) attached to its metadata. Your test should:

1. Inject an event with `trace_id: test-123`.
2. Query the logging/tracing platform (Jaeger, Datadog) for `test-123`.
3. Verify the trace reached the final consumer.

## Idempotency: The Duplicate Nightmare

Message queues promise "At Least Once" delivery. This is a polite way of saying "We might send you the same message twice just for fun."

If your consumer processes `PaymentReceived` twice, do you charge the user twice?

Your QA tests must explicitly inject duplicate events.

1. Send `Event X`. Verify Account Balance = £100.
2. Send `Event X` again. Verify Account Balance = £100.
3. If the balance is £200, you have a bug, and angry customers.

## Code Snippet: Testing Async Events

Here is a conceptual example using Jest to test an asynchronous event consumer. We use a "polling" mechanism to wait for the side effect.

```javascript
/* 
  The "Awaitility" Pattern.
  We cannot assert immediately. We must poll the DB until the state changes.
*/

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

test('Consumer processes OrderCreated event', async () => {
    const orderId = 'order-999';
    
    // 1. Publish the event to the Mock Queue
    await kafkaProducer.send({
        topic: 'orders',
        messages: [{ value: JSON.stringify({ id: orderId, type: 'OrderCreated' }) }],
    });

    // 2. Poll the Database for the result (Retry Pattern)
    let order = null;
    let attempts = 0;
    while(attempts < 10) {
        order = await db.collection('orders').findOne({ _id: orderId });
        if (order && order.status === 'PROCESSING') break;
        
        await sleep(500); // Wait 500ms and try again
        attempts++;
    }

    // 3. Assert (If we exit loop and order is still null, test fails)
    expect(order).not.toBeNull();
    expect(order.status).toBe('PROCESSING');
});
```

This prevents the dreaded "Flaky Test" that fails 10% of the time because the database was slightly slower than usual.

## Summary

Testing event-driven systems is not for the faint of heart. It involves race conditions, retries, and a lot of waiting.

But if you only test the happy path (synchronous success), you are not testing the system; you are testing your imagination. Real production systems are messy, asynchronous, and occasionally duplicate your data.

## Key Takeaways

- **Tracing is mandatory**: You cannot debug async flows without a Correlation ID.
- **Chaos reveals resilience**: What happens if the Consumer is down when the Producer sends a message? (Hint: The queue should hold it).
- **Schema Registry validates contracts**: Ensure your producer sends valid JSON that matches the consumer's expectations (Contract Testing).

## Next Steps

- **Inject**: Write a script to flood your staging Kafka topic with 1,000 events.
- **Measure**: How long is the "lag" between publish and process?
- **Crash**: Kill the Kafka broker and see if your app explodes or just waits patiently.
