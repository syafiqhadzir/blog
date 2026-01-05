---
layout: post
title: '2023 Year in Review: The Good, The Bad, and The Flaky'
date: 2023-12-28
category: QA
slug: year-in-review
gpgkey: EBE8 BD81 6838 1BAF
tags: ['qa-general']
description:
  'As 2023 comes to a close, we must do what all Agile teams do: drag ourselves
  into a meeting room, eat stale mince pies, and talk about "feelings".'
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Escaped Bug" Awards](#the-escaped-bug-awards)
- [Automation: Quality vs. Quantity](#automation-quality-vs-quantity)
- [Practical Artefact: The Retro Board](#practical-artefact-the-retro-board)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

As 2023 comes to a close, we must do what all Agile teams do: drag ourselves
into a meeting room, eat stale mince pies, and talk about "feelings".

A Year-End Retrospective is different from a sprint retro. We are not looking at
"Why did ticket QA-123 fail?". We are looking at "Why did we spend 6 months
building a framework that nobody uses?".

It is time for radical honesty. And hopefully, better coffee.

## TL;DR

- **Kill the Flakes**: If a test failed 50 times this year for "network issues",
  delete it.
- **Audit the Tools**: Are we actually using that expensive SaaS monitoring
  tool? No? Cancel it.
- **Celebrate**: You did not delete the production database this year. That is a
  win.

## The "Escaped Bug" Awards

Look at your sheer cliff face of JIRA tickets. Find the P1s that happened in
Production.

Categorise them:

- **The "It worked on my machine"**: Environment drift between Staging and Prod.
- **The "I didn't think of that"**: Edge cases (Null pointers, huge payloads).
- **The "Regression"**: We fixed X and broke Y.

**Action**: For every P1, ask: "Would an automated test have caught this?" If
yes, write it now. If no, improve your observability.

## Automation: Quality vs. Quantity

"We have 5,000 tests!" shouted the QA Lead. "Yes, and the build takes 4 hours,"
replied the DevOps Engineer, weeping.

2024 goal: Delete tests.

Yes, you heard me. Delete the tests that provide no value. Delete the UI tests
that check if the logo is the right shade of blue (nobody cares).

Focus on **High Value** tests. One end-to-end flow that processes a payment is
worth 1,000 unit tests that check if `User.getName()` returns a name.

## Practical Artefact: The Retro Board

Here is a markdown template for your team's year-end retro. Print it out. Stick
it on a virtual whiteboard.

```markdown
# 2023 QA Retrospective

## 🛑 STOP Doing

- Writing UI tests for things that never change.
- Manually verifying email delivery (Use Mailtrap!).
- Saying "It's a feature, not a bug" to the PM (It's not funny anymore).

## ▶️ START Doing

- Contract Testing (Pact) for microservices.
- Performance testing in the PR pipeline (k6).
- Leaving work on time.

## ⏩ CONTINUE Doing

- The Friday "Bug Bash" (it found 20 critical bugs).
- Pairing with developers on unit tests.
- Drinking good coffee.
```

## Summary

2023 was the year of "Efficiency". 2024 will be the year of "Intelligence".

We need to stop testing harder and start testing smarter. Cheers to another year
of finding bugs before the users do.

## Key Takeaways

- **Data Driven decisions**: Do not just say "Quality improved". Show the chart
  of "Bugs per Release".
- **Culture matters**: Quality is everyone's job. If Devs are not writing tests,
  you are not a QA team; you are a crutch.
- **Sanity preservation**: Take a break. The bugs will still be there in
  January.

## Next Steps

- **Archive**: Close all JIRA tickets older than 6 months. If it has not been
  fixed by now, it never will be.
- **Rest**: Turn off Slack.
- **Plan**: Schedule the "2024 Strategy Session" for the second week of Jan (let
  everyone wake up first).
