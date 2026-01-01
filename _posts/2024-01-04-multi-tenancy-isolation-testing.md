---
layout: post
title: 'Multi-Tenancy Isolation Testing: Good Fences Make Good SaaS'
date: 2024-01-04
category: QA
slug: multi-tenancy-isolation-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Coca-Cola vs. Pepsi" Scenario](#the-coca-cola-vs-pepsi-scenario)
- [Testing the Leak](#testing-the-leak)
- [Code Snippet: Breaking In](#code-snippet-breaking-in)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

If you are building a SaaS product, you are basically running a hotel. Everyone gets a room (Tenant), but they all share the same plumbing (Database).

A "Data Leak" is when the guest in Room 101 turns on their tap and gets the water intended for Room 102.

In the enterprise world, if Pepsi sees Coca-Cola's sales data because of a `WHERE tenant_id = ?` bug, you will not just lose a customer. You will lose your business.

## TL;DR

- **Authorisation needs testing**: Does `User A` have access to `Resource B`? (Should be 403 Forbidden).
- **Partitioning needs verification**: Ensure your DB queries *always* include the Tenant ID.
- **Cache needs namespacing**: Do not use global keys like `cache.get('dashboard_stats')`. Use `cache.get('tenant_123_dashboard_stats')`.

## The "Coca-Cola vs. Pepsi" Scenario

Imagine you have two tenants:

1. **Evil Corp** (Tenant ID: 1)
2. **Good Corp** (Tenant ID: 2)

A user from **Evil Corp** logs in. They have a valid JWT. They inspect the network traffic and see a request: `GET /api/orders/101`. They wonder: "What happens if I change that to 102?"

`GET /api/orders/102`

If your backend says "Here is the order for Good Corp", you have failed. The backend must check: "Does this User belong to the Tenant that owns Order 102?".

## Testing the Leak

We need to write **Negative Tests**. We rarely test for "access denied" enough.

1. Create `Tenant A` and `Tenant B`.
2. Create `Resource A` inside `Tenant A`.
3. Login as `User B` (from `Tenant B`).
4. Attempt to fetch `Resource A`.
5. Assert: `404 Not Found` (Best) or `403 Forbidden` (Acceptable).

## Code Snippet: Breaking In

Here is a Jest/Supertest script that attempts to breach tenant isolation.

```javascript
/* 
  multiTenancy.test.js
  Goal: Verify that UserB cannot see UserA's data. 
  "Insecure Direct Object Reference" (IDOR) check.
*/
const request = require('supertest');
const app = require('../app');
const { createTenant, createUser, createResource } = require('../test/factories');

describe('Multi-Tenancy Isolation', () => {
    let tenantA, tenantB;
    let userA, userB;
    let resourceA;

    beforeAll(async () => {
        // Setup the world
        tenantA = await createTenant({ name: 'Coca-Cola' });
        tenantB = await createTenant({ name: 'Pepsi' });
        
        userB = await createUser({ tenantId: tenantB.id, role: 'admin' });
        resourceA = await createResource({ tenantId: tenantA.id, data: 'Secret Recipe' });
    });

    it('should prevent User B from accessing Resource A', async () => {
        // User B tries to steal the recipe
        const res = await request(app)
            .get(`/api/resources/${resourceA.id}`)
            .set('Authorization', `Bearer ${userB.token}`);

        // Security Best Practice: Return 404 so they don't even know it exists
        // If you return 403, you are leaking the existence of the ID.
        expect(res.status).toBe(404); 
    });

    it('should access own resources correctly', async () => {
        const resourceB = await createResource({ tenantId: tenantB.id, data: 'Pepsi Formula' });
        
        const res = await request(app)
            .get(`/api/resources/${resourceB.id}`)
            .set('Authorization', `Bearer ${userB.token}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toBe('Pepsi Formula');
    });
});
```

## Summary

Multi-tenancy bugs are insidious because they often pass functional tests. "Can I view an order?" -> "Yes".

The question is "Can I view *someone else's* order?". You must specifically test the boundaries.

## Key Takeaways

- **Middleware centralises checks**: Implement isolation checks in a global middleware, not in every controller. It is too easy to forget.
- **UUIDs prevent guessing**: Use UUIDs instead of incremental IDs (1, 2, 3) to make guessing resources harder (Security through Obscurity is not security, but it helps).
- **Logs record breach attempts**: Ensure that when an isolation breach is attempted, it logs a "Security Alert".

## Next Steps

- **Audit**: Grep your codebase for `find()` calls that *do not* have a `tenant_id` clause.
- **Pentest**: Hire someone to try and break your isolation.
- **Automate**: Add the negative test suite to your CI pipeline.
