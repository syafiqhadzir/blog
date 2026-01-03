---
layout: post
title: 'Multi-Cloud Failover: Surviving the Apocalypse'
date: 2025-08-07
category: QA
slug: multi-cloud-failover
gpgkey: EBE8 BD81 6838 1BAF
tags:
- artificial-intelligence
- cloud
- reliability
- strategies
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Myth of "Cloud Agnostic"](#the-myth-of-cloud-agnostic)
- [The Data Gravity Problem](#the-data-gravity-problem)
- [Code Snippet: DNS Failover Simulation](#code-snippet-dns-failover-simulation)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

"AWS is down."

In 2013, this was a joke. In 2025, it happens. A region fails. A bad config rollout takes down `us-east-1`. Everyone
panics.

Multi-Cloud Failover means when AWS dies, your app automatically spins up in Google Cloud (GCP).

**QA Challenge**: Simulating a nuclear outage scenario without actually deleting your production database. It is a
delicate balance between thoroughness and not getting fired.

## TL;DR

- **Active-Active costs double**: Running two clouds is expensive (2x cost). Passive is cheaper but slower to wake up.
- **DNS switching is the big red button**: When you press it, everything changes. Test that it works before you need it.
- **Data consistency respects physics**: The speed of light is slow. Replication lag is real.

## The Myth of "Cloud Agnostic"

If you use AWS Lambda and DynamoDB, you cannot failover to GCP. Those services do not exist there.

To be truly portable, you must use **Kubernetes** and **Postgres** (or equivalent commodities) everywhere. QA must
verify that the app behaves *identically* on Azure AKS as it does on AWS EKS.

"Does the Azure Load Balancer handle WebSocket timeouts differently than the ALB?" (Yes, it does. Learn this the hard
way or learn it now.)

## The Data Gravity Problem

Application code is light (megabytes). Data is heavy (petabytes).

You cannot replicate 5 petabytes of data in real-time between AWS and GCP cheaply. The egress fees alone would fund a
small country.

**QA Strategy**: Test the **Recovery Point Objective (RPO)**. "If we switch to GCP, do we lose the last 5 minutes of
transactions?" Is that acceptable? If not, pay for synchronous replication.

## Code Snippet: DNS Failover Simulation

Simulating a health-check failure that triggers a DNS update (Route53 -> Cloudflare).

```javascript
/*
  failover-check.spec.js
*/
const axios = require('axios');
const dns = require('dns').promises;

// Mock Infrastructure
const CLOUDS = {
    AWS: { ip: '54.0.0.1', status: 'HEALTHY' },
    GCP: { ip: '34.0.0.1', status: 'STANDBY' }
};

let currentDNSTarget = CLOUDS.AWS.ip;

// The "Global Traffic Manager" Logic
function trafficManager() {
    if (CLOUDS.AWS.status === 'DEAD') {
        console.log('🚨 AWS Down! Switching to GCP...');
        currentDNSTarget = CLOUDS.GCP.ip;
    }
}

test('should route traffic to GCP when AWS fails', async () => {
    // 1. Initial State: Traffic goes to AWS
    expect(currentDNSTarget).toBe('54.0.0.1');
    
    // 2. Simulate Outage
    CLOUDS.AWS.status = 'DEAD';
    
    // 3. Trigger Detection
    trafficManager();
    
    // 4. Verify DNS Update
    expect(currentDNSTarget).toBe('34.0.0.1');
    
    // 5. Verify App Availability on new IP
    // const res = await axios.get(`http://${currentDNSTarget}/health`);
    // expect(res.status).toBe(200);
});
```

## Summary

Multi-cloud is insurance. You pay a premium for it.

If you do not test the failover, you are paying for insurance that will not pay out when the house burns down. Run a
"Game Day" drill every quarter. Pull the plug. Watch what happens. Learn from the chaos.

## Key Takeaways

- **Egress fees add up quickly**: Moving data out of AWS costs money. A failover test can cost £10,000 in bandwidth.
  Budget for QA.
- **Split brain is terrifying**: What if AWS comes back online whilst GCP is also running? Now you have two databases
  accepting writes. Chaos ensues.
- **Secrets must synchronise**: Do both clouds have the same API keys? Same certificates?

## Next Steps

- **Tool**: **Chaos Monkey** (Netflix) or **Gremlin**.
- **Learn**: Understand **BGP** (Border Gateway Protocol) and **Anycast**.
- **Goal**: Achieve "Five Nines" (99.999%) availability.
