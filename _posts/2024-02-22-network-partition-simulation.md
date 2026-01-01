---
layout: post
title: 'Network Partition Simulation Testing: Splitting the Brain'
date: 2024-02-22
category: QA
slug: network-partition-simulation
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
---## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [CAP Theorem (The Part We Ignore)](#cap-theorem-the-part-we-ignore)
- [Simulating the Split](#simulating-the-split)
- [Code Snippet: Creating a Partition with Blockade](#code-snippet-creating-a-partition-with-blockade)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Distributed systems are great until someone trips over a network cable.

Then you have two databases that both think they are the "Master". This is called a "Split-Brain" scenario. When they reconnect, who wins?

If your answer is "Last Write Wins", please hand in your badge. You just lost half your customer data.

## TL;DR

- **Consistency vs Availability is the trade-off**: You cannot have both during a partition. Choose one.
- **Chaos Testing finds issues early**: Do not wait for a real outage. Trigger one in Staging.
- **Recovery is the hard part**: The hard part is not the split; it is the merge.

## CAP Theorem (The Part We Ignore)

Eric Brewer said you can only pick two: Consistency, Availability, Partition Tolerance.

Since P (Partition Tolerance) is mandatory for any distributed system (networks fail, get over it), you actually only have a choice between C and A.

- **CP (Consistency)**: "I'd rather be down than wrong." (Banking).
- **AP (Availability)**: "I'd rather be wrong than down." (Twitter/X likes).

QA's job is to verify which one the developers *actually* implemented vs what they *think* they implemented.

## Simulating the Split

You do not need wire cutters. You have **iptables**. Or better yet, use tools like **Chaos Mesh** or **Pumba**.

If you are running Docker, `blockade` is a fantastic little tool to create partitions between containers.

## Code Snippet: Creating a Partition with Blockade

Blockade wraps Docker to allow you to model network failures.

```bash
# blockade.yml configuration example
# (Blockade is a CLI tool, but it uses a config file)
containers:
  node1:
    image: my-db:latest
    ports: [8080]
  node2:
    image: my-db:latest
  node3:
    image: my-db:latest

network:
  flaky: 30% # 30% packet loss
  slow: 100ms # add latency
```

Then run the chaos from your terminal:

```bash
# Isolate node3 from the others
blockade partition node1,node2 node3

# Watch the logs.
# Does Node 3 step down? 
# or does it keep accepting writes that will be lost later?
# If Node 3 keeps accepting writes, you have a Split Brain.
```

## Summary

If you do not test network partitions, you do not have a distributed system; you have a ticking time bomb.

Use chaos engineering to verify that your system behaves predictably when the network map looks like Swiss cheese.

## Key Takeaways

- **Quorum prevents split-brain**: Ensure your system needs N/2 + 1 nodes to accept writes. (e.g. 3 nodes need 2 to agree).
- **Timeouts cause false partitions**: Aggressive timeouts can cause partitions during slow traffic. Tunings matter.
- **Alerting must be immediate**: "Split Brain" should trigger a P1 pager alert immediately.

## Next Steps

- **Tooling**: Install **Chaos Mesh** in your K8s cluster.
- **Design**: Ask your architect "How do we handle conflict resolution on merge?"
- **Read**: *Designing Data-Intensive Applications* by Martin Kleppmann (The Bible of distributed systems).
