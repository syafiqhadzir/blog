---
layout: post
title: 'Optimistic Locking Testing: The ''Shotgun'' Rule'
date: 2023-07-13
category: QA
slug: optimistic-locking-testing
gpgkey: EBE8 BD81 6838 1BAF
tags: ["qa-general"]
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Lost Update Problem](#the-lost-update-problem)
- [Optimistic vs Pessimistic](#optimistic-vs-pessimistic)
- [Code Snippet: Simulating a Race](#code-snippet-simulating-a-race)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Imagine two people, Alice and Bob, open the same collaborative wiki page at 9:00 AM. Alice fixes a typo. Bob deletes the
entire paragraph.

Alice hits "Save" at 9:01. Bob hits "Save" at 9:02.

In a naive system, Bob's save overwrites Alice's save perfectly. Alice's work is lost forever. This is the **Lost
Update** problem.

To fix this, we need **Locking**. But locking the database (Pessimistic) makes your app slower than a sloth on
sedatives. The answer is **Optimistic Locking**.

## TL;DR

- **Version Number tracks changes**: Every record gets a `version` (or `_v`) column (1, 2, 3...).
- **The Rule enforces freshness**: You can only update `version: 5` if the database currently holds `version: 5`.
- **409 Conflict signals stale data**: If the version matches, the DB increments it to 6. If not, it throws an error.

## The Lost Update Problem

Testing concurrency is where most QA suites fail because they are inherently sequential.

```javascript
test('save profile', () => {
   updateProfile(); // Runs in isolation
   expect(success).toBe(true);
});
```

This test proves nothing about real-world usage. In the real world, requests overlap.

Optimistic locking is like the "Shotgun" rule for the front seat of a car. If you call it, but someone else sits down
first, you lose. You do not get to sit on top of them.

## Optimistic vs Pessimistic

- **Pessimistic Locking**: "I am editing this row. Nobody else can touch it until I am done." (Great for avoiding
  conflicts, terrible for performance).
- **Optimistic Locking**: "Go ahead and edit. But check if it changed before you save." (Great for performance, requires
  handling errors).

Your job as QA is to verify that **User B gets an error**, not a success.

## Code Snippet: Simulating a Race

We can simulate this "race" in a single integration test by fetching a record twice before saving once.

```javascript
import request from 'supertest';

test('prevents lost updates using versioning', async () => {
    // 1. Setup: Create a ticket
    // DB Ticket: { id: 1, title: 'Bug #1', version: 1 }
    const ticket = await createTicket({ title: 'Bug #1', version: 1 });

    // 2. Alice fetches the ticket
    const aliceView = await getTicket(ticket.id); // version: 1

    // 3. Bob fetches the same ticket
    const bobView = await getTicket(ticket.id);   // version: 1

    // 4. Alice updates it successfully
    // The DB sees sending version: 1, current is 1. Match!
    // DB sets version -> 2
    const resA = await request(app)
        .put(`/tickets/${ticket.id}`)
        .send({ title: 'Alice Title', version: aliceView.version });
    
    expect(resA.status).toBe(200);

    // 5. Bob tries to update it (using his STALE version)
    // The DB sees sending version: 1, current is 2. Mismatch!
    const resB = await request(app)
        .put(`/tickets/${ticket.id}`)
        .send({ title: 'Bob Title', version: bobView.version });

    // 6. Assert Bob failed
    expect(resB.status).toBe(409); // Conflict
    expect(resB.body.error).toMatch(/version mismatch/i);
});
```

## Summary

Optimistic locking is the standard for high-concurrency web apps. It shifts the complexity from the Database (locks) to
the Application (version checks) and the UI (handling merge conflicts).

If you do not test this scenario, your users will silently overwrite each other's work, and they will hate you for it.

## Key Takeaways

- **Hidden Fields need returning**: The `version` or `updated_at` field must be sent back to the server.
- **UI UX needs design**: A 409 error is not enough. The UI should say, "Someone else modified this record. Reload?"
- **Granularity needs verification**: Verify if the lock applies to the whole row or just specific columns.

## Next Steps

- **Inspect**: Check your database schema. Do your tables have a `version` or `_v` column?
- **Attack**: Try to automate a script that sends 50 concurrent updates to the same ID.
- **Monitor**: Alert on 409 Conflict spikes; it might mean your locking logic is too aggressive (or your app is getting
  popular).
