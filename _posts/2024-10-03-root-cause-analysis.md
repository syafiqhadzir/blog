---
layout: post
title: 'Root Cause Analysis: Sherlock Holmes Mode'
date: 2024-10-03
category: QA
slug: root-cause-analysis
gpgkey: EBE8 BD81 6838 1BAF
tags:
- quality-assurance
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Feature is not the Bug](#the-feature-is-not-the-bug)
- [Fishbone Diagrams (Ishikawa)](#fishbone-diagrams-ishikawa)
- [Practical Artifact: The RCA Template](#practical-artifact-the-rca-template)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

"The site is down."
"Why?"
"I don't know, restart the server."

This is not engineering. This is guessing. Root Cause Analysis (RCA) is the art of finding the *one true reason* things
broke, so you can kill it forever.

Do not fix the symptom (The server is slow). Fix the disease (The Memory Leak).

## TL;DR

- **Timeline establishes facts**: Establish a precise timeline of events (to the second). "At 14:02, traffic spiked."
- **Changes correlate with issues**: Correlation does not equal causation, but it is a good place to start. "What
  changed at 14:01?"
- **Logs are hints, not answers**: "Error: undefined is not a function" is a hint, not a cause. *Why* was it undefined?

## The Feature is not the Bug

User: "I can't login."
Developer: "I fixed the login button."
Real Cause: The database disk was full.

If you fixed the button (maybe adding a retry) but not the disk, the bug will return later.

**QA's job is to reject the "Fix" if it does not address the Root Cause**. If a dev says "I restarted it and it works
now", fail the ticket.

## Fishbone Diagrams (Ishikawa)

Draw a fish skeleton. Head = The Problem (e.g., "Latency Spike"). Ribs = Categories (People, Process, Technology,
Environment).

Brainstorm causes in each category:

- **People**: Did Dave push code on Friday afternoon?
- **Process**: Did we skip Code Review to meet a deadline?
- **Technology**: Did AWS have a bad day? (Verify with DownDetector).
- **Environment**: Is Staging config different from Prod? (It always is).

## Practical Artifact: The RCA Template

Copy this into your Jira ticket. If you do not fill this out, the bug is not closed.

```markdown
### 5 Whys Root Cause Analysis

**Incident**: Checkout 500 Error
**Impact**: 500 Users affected, £20k lost sales.

1. **Why?** The API returned 500.
2. **Why?** The Database Connection timed out.
3. **Why?** The Connection Pool was exhausted (Max 100).
4. **Why?** The new 'Reviews' service was opening connections but not closing them.
5. **Why?** The developer forgot the `finally { client.release() }` block.

**Root Cause**: Connection Leak in Review Service due to missing try/finally block.
**Fix**: Add release block.
**Prevention**: Add an ESLint rule (`no-unreleased-connection`) to catch this globally.
```

## Summary

RCA is painful. It requires honesty. It requires admitting "I messed up."

But a Blameless RCA culture allows for growth. If you punish mistakes, people hide the root cause ("It was a glitch").
If you celebrate finding the root cause, you build resilience.

## Key Takeaways

- **Blameless culture enables learning**: Focus on the *system* that allowed the human error, not the human. Why was it
  possible for Dave to push to Prod on Friday? Where was the guardrail?
- **Swiss Cheese Model explains failures**: Accidents happen when holes in multiple layers of defence align. Close the
  holes.
- **Action Items make RCAs valuable**: An RCA without Action Items (Verification tasks) is just a diary entry.

## Next Steps

- **Tool**: Use **PagerDuty** or **Opsgenie** for Incident Management timelines.
- **Learn**: Read Google's **SRE Book** (Chapter on Postmortems). It is the bible.
- **Audit**: Look at your last 5 bug fixes. Did you fix the root cause, or just patch the symptom? Be honest.
