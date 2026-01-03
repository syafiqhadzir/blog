---
layout: post
title: 'Load Balancing Test Strategies: The Traffic Cop from Hell'
date: 2023-06-15
category: QA
slug: load-balancing-test-strategies
gpgkey: EBE8 BD81 6838 1BAF
tags: ['load-testing', 'performance']
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Round Robin vs The World](#round-robin-vs-the-world)
- [Sticky Sessions: The Evil Necessity](#sticky-sessions-the-evil-necessity)
- [Code Snippet: Smart Nginx Upstreams](#code-snippet-smart-nginx-upstreams)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Imagine a nightclub with one bouncer. He is checking IDs, taking cover charges,
and flirting with patrons. The queue wraps around the block. This is your
single-server architecture.

Now imagine ten bouncers. But wait—everyone is still queuing at Bouncer 1,
whilst Bouncers 2-10 are playing solitaire. This is a poorly configured **Load
Balancer**.

The Load Balancer (LB) is the traffic cop of your cluster. It decides who goes
where. Testing it is not just about "does it work?"; it is about "does it work
_fairly_?".

## TL;DR

- **Algorithm Matters**: "Round Robin" is simple but dumb. "Least Connections"
  is smarter usage of resources.
- **Failover needs testing**: If a server dies, does the LB notice immediately,
  or does it keep sending users into a black hole?
- **Termination offloads work**: Let the LB handle SSL/TLS decryption to save
  CPU cycles on your app servers.

## Round Robin vs The World

The default setting on almost every LB is **Round Robin**.

- Request 1 -> Server A
- Request 2 -> Server B
- Request 3 -> Server A

It works fine if every request takes exactly 100ms. But what if Request 1
involves generating a PDF report (5 seconds), and Request 2 is a simple "Hello
World" (5ms)?

Server A gets bogged down. Server B is bored. The LB blindly sends Request 3 to
Server A because "it's your turn," causing a backlog.

QA must verify that **Least Connections** mode is active for CPU-heavy
applications. This ensures traffic flows to the node that is actually free, not
just the one that is "next".

## Sticky Sessions: The Evil Necessity

Stateless apps are heaven. Stateful apps (using server-side Sessions) are hell.

If User A logs in on Server 1, their session data is in Server 1's RAM. If the
LB sends their next request to Server 2, they get logged out.

To fix this, we enable **Sticky Sessions** (Session Affinity). The LB drops a
cookie saying "This guy belongs to Server 1".

**The Risk**: If Server 1 crashes, all those users lose their session instantly.
Sticky sessions break high availability. Testing this failure scenario is
critical.

## Code Snippet: Smart Nginx Upstreams

Here is a standard Nginx config that implements "Least Connections" and a
passive health check.

```nginx
http {
    upstream my_backend {
        # Use Least Connections algorithm (smarter than Round Robin)
        least_conn;

        # The servers
        server backend1.example.com:8080 max_fails=3 fail_timeout=30s;
        server backend2.example.com:8080 max_fails=3 fail_timeout=30s;

        # Backup server only used if everyone else is dead (Crisis Mode)
        server backup.example.com:8080 backup;
    }

    server {
        location / {
            proxy_pass http://my_backend;

            # Application Layer Health Check
            # If backend returns 500, automatically retry the next server
            # This makes the error INVISIBLE to the user. Magic.
            proxy_next_upstream error timeout http_500;
        }
    }
}
```

## Summary

The Load Balancer is mostly invisible, so it gets ignored during testing. But a
misconfigured LB can turn a 10-node cluster into a 1-node bottleneck.

We must verify its decision-making logic, its failover speed, and its
distribution fairness.

## Key Takeaways

- **Distribution needs verification**: Verify that load is actually strictly
  distributed (check the logs on all nodes).
- **Health Checks need aggression**: Are they aggressive enough? Detecting a
  dead node in 30 seconds is too slow; aim for <5 seconds.
- **Buffers prevent blocking**: Ensure the LB buffers slow client uploads so
  your Node.js thread is not blocked by a user on 3G.

## Next Steps

- **Audit**: Check your Nginx/HAProxy/AWS ALB config. Is it using Round Robin?
- **Simulate**: Use `k6` to send 1,000 requests and count the distribution
  across pods.
- **Kill**: Terminate a pod whilst running a load test. Measure the % of 502
  errors returned before the LB adjusted.
