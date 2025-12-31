---
layout: post
title: "Incident Post-Mortems: Who Killed the Server?"
date: 2023-10-19
category: QA
slug: incident-postmortems-qa
gpgkey: "EBE8 BD81 6838 1BAF"
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Blame Game (And How to Stop It)](#the-blame-game-and-how-to-stop-it)
- [The 5 Whys: Channeling Your Inner Toddler](#the-5-whys-channeling-your-inner-toddler)
- [Practical Artefact: The "Mea Culpa" Template](#practical-artefact-the-mea-culpa-template)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

So, Production is down. The CTO is pacing, the customers are tweeting, and the coffee machine is broken. Eventually, you fix the bug (it was a missing semicolon, was it not?).

Now comes the most important part: The **Post-Mortem**.

Unfortunately, many companies treat this as a "Who do we fire?" meeting. This is wrong. A good QA turns this meeting into a "How do we make sure this never happens again?" party.

## TL;DR

- **Blameless culture is essential**: Attack the *process*, not the *person*.
- **Root Cause needs discovery**: Use the "5 Whys" to find the real issue (usually a missing test or guardrail).
- **Action Items must be tracked**: If you do not create a ticket to fix it, you will repeat it.

## The Blame Game (And How to Stop It)

Human error is inevitable. If your system collapses because Dave from Accounting clicked the wrong button, the problem is not Dave; the problem is that you gave Dave a button that destroys the system.

When leading a post-mortem, use **Blameless Language**:

- **Bad**: "Sarah forgot to update the config."
- **Good**: "The deployment process did not verify the config version, allowing a mismatch."

Your goal is to build a safety net so strong that even a sleep-deprived intern cannot break prod. Challenge accepted?

## The 5 Whys: Channeling Your Inner Toddler

To find the root cause, you must ask "Why?" until it becomes annoying.

**The Incident**: The API returned 500 errors for 2 hours.

1. **Why?** The database connection pool was exhausted.
2. **Why?** The new Recommendation Service opened too many connections.
3. **Why?** It opens a new connection for every user request instead of reusing them.
4. **Why?** The developer did not know how to configure the ORM correctly.
5. **Why?** **We lack code review guidelines for ORM configurations and have no load tests for concurrency.**

*Bingo.* Now we have actionable items: "Write ORM Guidelines" and "Add Load Testing".

## Practical Artefact: The "Mea Culpa" Template

Do not start from scratch. Copy this Markdown template into your issue tracker (Jira/GitHub Issues) for every Sev-1 incident.

```markdown
# 💀 Incident Post-Mortem: [Incident Name]

**Date**: YYYY-MM-DD
**Severity**: Sev-1 / Sev-2
**Authors**: @user1, @user2

## 🚨 Summary
*Briefly describe what happened, the impact (e.g., "Checkout was down for 45 mins"), and how it was fixed.*

## 🕵️ Root Cause Analysis (5 Whys)
1. Why?
2. Why?
3. Why?
4. Why?
5. **Root Cause**:

## 🧪 Detection & Recovery
- **Time to Detect (TTD)**: 15 mins (Source: PagerDuty)
- **Time to Resolve (TTR)**: 30 mins
- **How was it detected?**: (Customer Report / Automated Alert) *Be honest!*

## 🛠 Action Items
- **Fix**: Apply permanent patch. (Link to PR)
- **Test**: Add automated regression test to prevent recurrence.
- **Process**: Update documentation or onboarding guide.
```

## Summary

A post-mortem without action items is just a group therapy session.

The value of an incident is the lesson it teaches. If you pay the tuition (downtime), make sure you learn the lesson (process improvement).

## Key Takeaways

- **Psychological Safety enables honesty**: If people are afraid to admit mistakes, they will hide them.
- **Automate the Fix**: Do not just "try harder next time". Build a tool that makes it impossible to fail.
- **Share the Knowledge**: Publish the post-mortem so other teams can learn from your scars.

## Next Steps

- **Schedule it**: Book the post-mortem within 24 hours of the incident.
- **Template it**: Add the template above to your Confluence/Notion.
- **Track it**: Review open Action Items in your weekly planning.
