---
layout: post
title: 'Agent Swarm Testing: Herding AI Cats'
date: 2025-05-29
category: QA
slug: agent-swarm-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Emergent Behaviour (The Ghost in the Machine)](#emergent-behaviour-the-ghost-in-the-machine)
- [Negotiation Protocols](#negotiation-protocols)
- [Code Snippet: Agent Negotiation](#code-snippet-agent-negotiation)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

One AI Agent is a helper. One hundred AI Agents is a Swarm. They talk to each other. They trade. They fight over resources.

**QA Challenge**: You cannot test them individually. You have to test the *crowd*.

If Agent A hates Agent B, and Agent B hates Agent C, does the whole network deadlock like a Thanksgiving dinner political debate? Only testing reveals the answer.

## TL;DR

- **MAS (Multi-Agent Systems)**: Distributed AI. No central brain.
- **Micro-Economics applies**: Agents need a currency (tokens/priority) to prioritise tasks. Otherwise, everything is P0.
- **Looping causes deadlocks**: "I'm waiting for you." "No, I'm waiting for you." (Distributed Deadlock).

## Emergent Behaviour (The Ghost in the Machine)

You program simple rules: "Walk forward", "Avoid neighbour", "Seek food". Suddenly, they form a flock. Or a mosh pit. This is **Emergence**. You did not code "Flocking", but "Flocking" happened.

**QA Strategy**: Simulation (Monte Carlo). Run 10,000 steps. Check for "Stampedes" (All agents rushing to one API endpoint simultaneously). Check for "Starvation" (One agent hoarding all the resources).

## Negotiation Protocols

Agent A: "I need the CPU for task X."
Agent B: "I have high priority for task Y."
Agent A: "I will give you 5 tokens if you wait."

This is the **Contract Net Protocol**.

**QA Test**: Verify contract fulfilment. Did Agent A actually pay? Or is it a scammer bot? Trust nothing.

## Code Snippet: Agent Negotiation

Testing a bidding war for resources.

```javascript
/*
  economics.spec.js
*/
class Agent {
    constructor(id, budget) {
        this.id = id;
        this.budget = budget;
    }
}

class Auction {
    constructor(resource) {
        this.resource = resource;
        this.bids = [];
    }
    
    bid(agent, amount) {
        if (agent.budget >= amount) {
            this.bids.push({ agent, amount });
        }
    }
    
    resolve() {
        // Sort by amount desc
        this.bids.sort((a, b) => b.amount - a.amount);
        const winner = this.bids[0];
        
        if (winner) {
            // Transaction
            winner.agent.budget -= winner.amount;
            return winner.agent;
        }
        return null;
    }
}

test('should resolve resource conflict via auction', async () => {
    const resource = 'GPU-01';
    const highBidder = new Agent('RichBot', 100);
    const lowBidder = new Agent('PoorBot', 10);
    
    // Start Auction
    const auction = new Auction(resource);
    auction.bid(highBidder, 50);
    auction.bid(lowBidder, 10);
    
    const winner = auction.resolve();
    
    expect(winner.id).toBe('RichBot');
    expect(highBidder.budget).toBe(50); // Payment deducted
    expect(lowBidder.budget).toBe(10);  // No charge for loser
});
```

## Summary

The future of software is not writing code. It is writing the *Constitution* for the software to govern itself.

We are building digital civilisations. If we do not write good laws (protocols), we get digital anarchy.

## Key Takeaways

- **Self-DDoS is possible**: Your agents might accidentally DDoS your own server. Rate limit your children. Ideally, they should communicate peer-to-peer.
- **Communication needs standards**: Use standard protocols (ACL, KQML) or JSON-RPC. Do not invent your own language.
- **Kill Switch is mandatory**: You need a "Command & Control" override. "Order 66: Shutdown All Agents." Test this feature weekly.

## Next Steps

- **Tool**: Use **JADE** (Java Agent Development Framework) or modern equivalents like **AutoGPT** or **BabyAGI**.
- **Learn**: Read about **Game Theory** (Nash Equilibrium). It explains why agents cheat.
- **Audit**: Are your agents spending too much cloud money? Infinite scaling = Infinite bill. Implement a "Wallet Cap".
