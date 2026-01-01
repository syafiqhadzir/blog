---
layout: post
title: "Shift Left Testing: Or How to Avoid Working Weekends"
date: 2023-01-05
category: QA
slug: shift-left-testing
gpgkey: "EBE8 BD81 6838 1BAF"
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Cost of Late Bugs](#the-cost-of-late-bugs)
- [What "Shift Left" Actually Means](#what-shift-left-actually-means)
- [Code Snippet: The Quality Gate](#code-snippet-the-quality-gate)
- [The Shift-Left Guide](#the-shift-left-guide)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

"Shift-Left" is one of those corporate buzzwords that middle managers love to chant during stand-ups. They say it with the same reverence as "synergy" or "paradigm shift".

But unlike most buzzwords, this one actually means something. It is about moving the pain of testing earlier in the timeline, so you do not wake up screaming the night before a release.

## TL;DR

- **Prevention over Cure**: Fixing a bug in design costs £1. Fixing it in production costs £10,000 (and your dignity).
- **Collaboration is key**: QA should be in the design meeting, not just waiting for a JIRA ticket.
- **Automation enables speed**: Run tests on every commit, not just nightly.

## The Cost of Late Bugs

Imagine you are building a house.

1. **Design Phase**: Moving a toilet on the blueprint involves an eraser. Cost: **Free**.
2. **Construction Phase**: Moving a toilet after the concrete is poured involves a jackhammer. Cost: **Expensive**.
3. **Live Phase**: Moving a toilet after the family moves in involves lawsuits. Cost: **Astronomically high**.

Software is no different. A bug found in requirements is just a conversation. A bug found in production is an incident report.

## What "Shift Left" Actually Means

In the traditional Waterfall model (may it rest in peace), testing happened at the very end. The developers would throw code over the wall, and QA would scramble to find bugs in a panic.

Shifting Left means dragging the QA chair over to the developer's desk. It means asking "How are we going to test this?" whilst the feature is still a drawing on a whiteboard. It turns testing from a "phase" into a continuous activity.

## Code Snippet: The Quality Gate

Shifting left technically means automating checks as early as possible. Here is a GitHub Actions workflow that blocks bad code before it even gets merged.

```yaml
name: Shift Left Quality Gate

on: [pull_request]

jobs:
  quality_check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # 1. Static Analysis (Fastest) - Finds typos and style errors
      - name: Linting
        run: npm run lint
        
      # 2. Type Checking - Finds logic errors
      - name: TypeScript Check
        run: tsc --noEmit
        
      # 3. Security Audit - Finds vulnerabilities
      - name: Security Audit
        run: npm audit
        
      # 4. Unit Tests - Finds broken functions
      - name: Unit Tests
        run: npm run test:unit
```

If this pipeline fails, the developer cannot merge. That is the ultimate shift left—the bug literally cannot enter the codebase.

## The Shift-Left Guide

Use this guide for your next feature:

- **Design Review**: Did QA review the mockups for edge cases?
- **API Contract**: Is the API defined (OpenAPI/Swagger) before coding starts?
- **Unit Tests**: Are developers writing tests for their own logic?
- **Pipeline**: Do tests run automatically on every Pull Request?

## Summary

Shift-left is not just about tools; it is a cultural shift. It empowers developers to own quality and allows QA engineers to focus on strategy rather than finding trivial typos.

It transforms the QA role from "The Gatekeeper" to "The Quality Coach".

## Key Takeaways

- **Start Early**: Test ideas, then designs, then code.
- **Automate ruthlessly**: Humans should not do what a script can do faster.
- **Fail Fast**: It is better to fail in a PR than in production.

## Next Steps

- **Audit**: Do you have a CI check that runs on every PR?
- **Join a Meeting**: Ask to be invited to the next "Architecture" or "Kick-off" meeting.
- **Reject a Ticket**: If a ticket lacks clear requirements, send it back. That is shifting left.
