---
layout: post
title: 'Disaster Recovery Testing: The Datacentre is on Fire'
date: 2024-10-24
category: QA
slug: disaster-recovery-testing
gpgkey: EBE8 BD81 6838 1BAF
tags: ['reliability', 'data-testing']
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [RTO and RPO: The Holy Acronyms](#rto-and-rpo-the-holy-acronyms)
- [The "Region Kill" Simulation](#the-region-kill-simulation)
- [Practical Artifact: The DR Checklist](#practical-artifact-the-dr-checklist)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

"AWS is down."

No, it is not. `us-east-1` is down. The other 25 regions are fine. Your app is
down because you put all your eggs in the `us-east-1` basket.

Disaster Recovery (DR) QA is asking: "If I delete this database, do we lose the
company?" If the answer is "Yes", cancel your weekend plans.

## TL;DR

- **Backups need restoration testing**: A backup is useless if you cannot
  restore it. Test the **Restore**, not the Backup.
- **Failover needs clarification**: Automated or Manual? If manual, does the
  person with the keys sleep through alerts? (Murphy's Law: Incidents happen at
  3 AM).
- **Communication needs backup channels**: Who tweets "We are investigating"
  when Slack is also down? (You need an out- of-band communication channel).

## RTO and RPO: The Holy Acronyms

**RTO (Recovery Time Objective)**: How long can we be down? (e.g., 4 hours).
**RPO (Recovery Point Objective)**: How much data can we lose? (e.g., 15 minutes
of transactions).

**QA's Job**: Measure the _actual_ RTO/RPO during a drill. If Ops says RTO is 1
hour, but it takes 6 hours to download the 5TB database dump... you failed the
SLA.

## The "Region Kill" Simulation

You do not need to actually burn down a datacentre (please do not). But you
should simulate it.

1. **Block traffic**: Deny all ingress/egress to the Primary Region.
2. **Observe**: Does the monitoring dashboard go red? Does the Load Balancer
   auto-shift traffic?
3. **Failover**: Promote the Read Replica in Region B to Primary.
4. **Smoke Test**: Can I still buy a widget?
5. **Failback**: This is often harder than Failover. How do you sync the new
   data back to the old region when it comes back online?

## Practical Artifact: The DR Checklist

Only pass the release if you can answer YES to these:

1. [ ] Backups are encrypted and stored in a _different_ region (S3 Cross-Region
       Replication).
2. [ ] The "Break Glass" admin credentials work (and are not expired or
       protected by an MFA app on a lost phone).
3. [ ] DNS TTL (Time To Live) is low (e.g., 60s) for rapid switching.
4. [ ] We have a static "Maintenance Page" hosted on S3/Netlify (completely
       outside our infra) to tell users what is happening.

## Summary

Disaster Recovery is insurance. You hate paying for it. You hope you never use
it.

But when the hurricane hits, you really hope you read the policy correctly. Test
the apocalypse.

## Key Takeaways

- **Game Days build muscle memory**: Periodic, scheduled days where you
  intentionally break things (Chaos Engineering) to train the team.
- **Hard Dependencies need backup plans**: Does your login depend on a third
  party (Auth0)? What if _they_ are down? Do you have a backdoor? (Careful with
  that).
- **Documentation needs offline access**: Access to the DR Runbook should not
  require the VPN (which might be down). Print it out. Laminate it.

## Next Steps

- **Tool**: Use **AWS FIS** (Fault Injection Simulator) to simulate outages.
- **Learn**: Read about **Active-Active** (two regions running simultaneously)
  vs **Active-Passive** (one serves traffic, one waits).
- **Audit**: When was the last time you restored a production backup to staging?
  Do it today. You might find it is corrupted.
