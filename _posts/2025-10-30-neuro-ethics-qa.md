---
layout: post
title: "Neuro-Ethics for QA: Defending the User's Mind"
date: 2025-10-30
category: QA
slug: neuro-ethics-qa
gpgkey: EBE8 BD81 6838 1BAF
tags: ['ethics']
description:
  'In the 2010s, "Growth Hacking" was praised. "We increased ''Time on Site'' by
  500%!" The champagne flowed.'
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Addiction as a Bug](#addiction-as-a-bug)
- [The Dopamine Feedback Loop](#the-dopamine-feedback-loop)
- [Code Snippet: Analysing Notification Velocity](#code-snippet-analysing-notification-velocity)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

In the 2010s, "Growth Hacking" was praised. "We increased 'Time on Site' by
500%!" The champagne flowed.

In the 2020s, we realised that 500% more time on site meant 500% more anxiety,
depression, and loss of sleep. The champagne stopped flowing. The lawsuits
started.

**Neuro-Ethics QA** is the practice of finding features that exploit human
psychology and flagging them as Defects. It is "Digital Wellness" enforcement.
We are the FDA for software. Except we do not have regulatory authority, so we
rely on guilt and strongly-worded bug reports.

## TL;DR

- **Dark Patterns are bugs**: A "Cancel Subscription" button that is four shades
  lighter than the background is a bug. It is also illegal in the EU.
- **Infinite Scroll lacks stopping cues**: Tests should verify a "You're all
  caught up" message exists. The brain needs a break.
- **Notification spam is an attack**: If an app sends fifty prompts a day, it is
  a Denial of Service attack on the brain.

## Addiction as a Bug

If your toaster did not turn off, it would be defective. If your app does not
let the user go, it is defective. The logic is identical; the consequences
differ only in whether you burn the bread or the user's mental health.

**QA Strategy**: Measure the **Session Length Distribution**. If the median
session is five minutes, but the p99 session is eight hours, you have created a
Skinner Box. Flag this as a "Product Health" risk. Tell the PM: "We are harming
our users." They will not like it. Tell them anyway.

## The Dopamine Feedback Loop

"Variable Rewards" (Pull-to-Refresh) trigger dopamine. It is the same mechanism
as slot machines, which is probably why casinos are not allowed to operate as
productivity apps.

QA must verify that these mechanics are not used for essential utilities. "Why
does checking my bank balance require a slot machine animation?" That is not
engagement—that is psychological manipulation dressed in a friendly UI.

**Defect**: "Unnecessary Gamification". **Priority**: P1.

## Code Snippet: Analysing Notification Velocity

A script to audit the volume of push notifications sent to a single user.

```javascript
/*
  notification-audit.js
*/

// Mock Log of Push Events
const pushLogs = [
  { timestamp: '2025-10-30T09:00:00Z', type: 'marketing' },
  { timestamp: '2025-10-30T09:05:00Z', type: 'marketing' },
  { timestamp: '2025-10-30T09:10:00Z', type: 'marketing' },
  { timestamp: '2025-10-30T09:15:00Z', type: 'transactional' },
];

function auditNotificationVelocity(logs) {
  const timeWindow = 60 * 60 * 1000; // 1 Hour
  let spamCount = 0;

  // Simple verification
  // Are we sending > 3 notifications per hour?
  // If yes, we are spamming.
  const start = new Date(logs[0].timestamp).getTime();

  for (const log of logs) {
    if (new Date(log.timestamp).getTime() - start < timeWindow) {
      spamCount++;
    }
  }

  console.log(`Velocity: ${spamCount} notifications/hour`);

  if (spamCount > 3) {
    console.error('❌ FAIL: Notification Fatigue Risk. Limit exceeded.');
    return false;
  }
  console.log('✅ PASS: Notification volume is humane.');
  return true;
}

auditNotificationVelocity(pushLogs);
```

## Summary

We are the architects of the digital environment. If we build a casino, people
will get addicted. If we build a library, people will learn.

QA decides which features pass the gate. Be the Librarian, not the Pit Boss.

## Key Takeaways

- **Consent must be genuine**: "Dark Nudges" that trick the user into sharing
  contacts are unethical. Test the UI for misleading copy.
- **Exit must be easy**: Test the "Delete Account" flow. It should take fewer
  than three clicks. If the user has to call a phone number to cancel, that is a
  defect.
- **Colour psychology matters**: Red implies urgency or danger. Do not use red
  badges for "New Feature Available". That creates artificial cortisol spikes.

## Next Steps

- **Tool**: **Humane Design Guide** (Centre for Humane Technology).
- **Law**: **Age Appropriate Design Code** (UK/California). It is the law.
- **Metric**: "Time Well Spent" vs "Time Spent".
