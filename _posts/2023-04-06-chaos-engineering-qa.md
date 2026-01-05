---
layout: post
title: 'Chaos Engineering for QA: Breaking Production on Purpose'
date: 2023-04-06
category: QA
slug: chaos-engineering-qa
gpgkey: EBE8 BD81 6838 1BAF
tags: ['chaos-testing']
description:
  'Chaos Engineering is the discipline of experimenting on a system to build
  confidence in its capability to withstand turbulent conditions.'
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Why Would I Do This?](#why-would-i-do-this)
- [The Hypothesis Method](#the-hypothesis-method)
- [Code Snippet: A Simple Chaos Script](#code-snippet-a-simple-chaos-script)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Chaos Engineering is the discipline of experimenting on a system to build
confidence in its capability to withstand turbulent conditions.

In simpler terms: We break things on purpose whilst we are watching, so they do
not break by accident when we are sleeping. It is the ultimate QA test. "Oh, you
think your system is robust? Let us unplug the database."

## TL;DR

- **Do not Start in Prod**: Start in Staging. Seriously.
- **Hypothesis drives experiments**: "If I kill one server, the load balancer
  should redirect traffic instantly."
- **Blast Radius needs limiting**: Start small (kill one pod), then go big (kill
  an Availability Zone).
- **Observability is mandatory**: If you cannot measure the pain, do not inflict
  it.

## Why Would I Do This?

"Why would I break my own app?"

Because Amazon is going to break it for you anyway. Networks fail. Hard drives
die. Squirrels chew through fibre optic cables.

The goal of chaos testing is not to cause disaster, but to prove that your
system can handle the disaster gracefully. When you kill a database instance,
does the application fail over to the replica, or does it throw a 500 error and
cry?

## The Hypothesis Method

Chaos Engineering is science, not anarchy.

1. **Steady State**: "Our homepage loads in 200ms."
2. **Hypothesis**: "If we introduce 500ms of latency to the User Service, the
   homepage should still load in < 300ms because of caching."
3. **Experiment**: Add latency (using Gremlin or Istio).
4. **Verify**: Did it work? If yes, great. If no, you found a bug.

## Code Snippet: A Simple Chaos Script

You do not need fancy tools to start. Here is a simple Node.js script that
randomly kills a specific process (simulating a crash).

```javascript
// chaos-monkey.js
const { exec } = require('child_process');

function killRandomService() {
  const services = ['order-service', 'user-service', 'inventory-service'];
  const victim = services[Math.floor(Math.random() * services.length)];

  console.log(`🐒 Chaos Monkey is looking at ${victim}...`);

  // Simulate finding the PID and killing it
  // In real life: kubectl delete pod ${victim}
  setTimeout(() => {
    console.log(`💥 POW! ${victim} has been terminated.`);
    // exec(`pkill -f ${victim}`); // DANGER: Do not run this on my laptop
  }, 2000);
}

// Run every 10 seconds
setInterval(killRandomService, 10000);
```

Run this in your Staging environment. Watch your monitoring dashboard. Do you
get an alert? If not, fix your alerts.

## Summary

Resilience is built, not found. By intentionally breaking things in controlled
environments, we ensure they do not break in production at 3 AM.

Chaos is the forge of reliability.

## Key Takeaways

- **Start Small**: Do not shut down the whole data centre on day one.
- **Automate chaos**: Chaos should run continuously (like Netflix's Chaos
  Monkey).
- **Fix It**: If an experiment fails, it is a P1 bug. Fix it before running it
  again.

## Next Steps

- **Game Day**: Schedule a "Game Day" where the team gathers to run manual chaos
  experiments.
- **Kill a Pod**: Go to Kubernetes and delete a random pod. See what happens.
- **Add Latency**: Use your API Gateway to inject 2s latency. Does the frontend
  show a spinner or a blank screen?
