---
layout: post
title: 'Migration Performance Testing: Swapping the Engine Mid-Flight'
date: 2025-08-14
category: QA
slug: migration-performance-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:
- performance
- strategies
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Microservices Tax"](#the-microservices-tax)
- [Shadow Traffic](#shadow-traffic)
- [Code Snippet: Shadowing Requests](#code-snippet-shadowing-requests)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

"We are moving from Ruby on Rails to Go. It will be 10x faster."

Will it?

Migrations often **degrade** performance initially. Why? Because the old Monolith had shared memory. The new
Microservices have Network Latency. To send a User Object from Service A to Service B takes 10ms. In memory, it took
0.0001ms. That is a substantial difference, and nobody mentioned it in the planning meeting.

**QA Challenge**: Validate that the performance gain outweighs the network overhead.

## TL;DR

- **Latency budget awareness**: Every network hop adds latency. 10 Microservices = 10 Hops. Plan accordingly.
- **Data parity verification**: "JSON output from New API must equal JSON output from Old API". Character for character.
- **Cutover strategy matters**: Canary (1%), then 10%, then 100%. Never Big Bang.

## The "Microservices Tax"

When you split a monolith, you introduce:

1. **Serialisation Cost**: JSON.stringify() / JSON.parse().
2. **Network IO**: TCP handshakes, TLS termination.
3. **Distributed Tracing overhead**.

QA must measure this "Tax". If a request now takes 200ms instead of 50ms, the migration is a failure, even if the Go
code is "fast". Fast code in a slow architecture is still slow.

## Shadow Traffic

The best way to test a migration is **Shadowing** (Dark Launching).

1. User hits `api.example.com` (The Old Monolith).
2. Load Balancer sends the request to Old Monolith **AND** New Service (Async).
3. Old Monolith returns response to User.
4. New Service processes request, but **discards** the response.
5. Metrics compare the two.

If the new service explodes, nobody notices. If it succeeds, you have proof.

## Code Snippet: Shadowing Requests

A simple Node.js proxy middleware that duplicates traffic for comparison.

```javascript
/*
  shadow-proxy.js
*/
const axios = require('axios');
const express = require('express');
const app = express();

const OLD_API = 'http://localhost:3000';
const NEW_API = 'http://localhost:4000';

app.use(async (req, res) => {
    const start = Date.now();
    
    // 1. Send to Primary (Old) - Wait for it
    const primaryPromise = axios({
        method: req.method,
        url: OLD_API + req.url,
        data: req.body,
        headers: req.headers
    });
    
    // 2. Send to Shadow (New) - Fire and Forget
    const shadowPromise = axios({
        method: req.method,
        url: NEW_API + req.url,
        data: req.body,
        headers: req.headers
    }).then(response => {
        const duration = Date.now() - start;
        console.log(`[Shadow] Status: ${response.status}, Time: ${duration}ms`);
        // Compare response.data with primary response here
    }).catch(err => {
        console.error(`[Shadow] Failed: ${err.message}`);
    });
    
    try {
        const response = await primaryPromise;
        const duration = Date.now() - start;
        console.log(`[Primary] Status: ${response.status}, Time: ${duration}ms`);
        
        // Return Primary result to user
        res.status(response.status).send(response.data);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(8080, () => console.log('Shadow Proxy running on 8080'));
```

## Summary

Migrations are risky. Shadowing reduces risk to nearly zero.

It allows you to test the new system with **Real Production Traffic** without affecting real users. If the New Service
crashes, nobody notices. That is the dream.

## Key Takeaways

- **Idempotency matters enormously**: Be careful shadowing `POST` requests. You do not want to charge the user's credit
  card twice!
- **Noise increases costs**: Shadowing doubles your log volume. Watch your Datadog bill.
- **Baseline before you start**: Establish a p99 baseline BEFORE you start coding. "The Monolith handles 1000 RPS at
  200ms". Beat it.

## Next Steps

- **Tool**: **Envoy Proxy**, **Traefik**, or **Nginx** `mirror` module.
- **Framework**: **Scientist** (GitHub's Ruby library for refactoring experiments).
- **Read**: "Rebuilding the plane while flying it."
