---
layout: post
title: 'SRS, FRS & BRS: The Alphabet Soup of Requirements'
date: 2022-11-24
category: QA
slug: srs-frs-brs
gpgkey: D25D D0AD 3FDB F7C6
tags: ['methodology', 'frontend-testing']
description:
  'Welcome to the world of acronyms, where we turn simple concepts into
  three-letter abbreviations to sound smarter in meetings. QA and testing
  professionals must'
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Holy Trinity of Docs](#the-holy-trinity-of-docs)
- [SRS: The "Contract"](#srs-the-contract)
- [FRS: The "Manual"](#frs-the-manual)
- [BRS: The "Why"](#brs-the-why)
- [Code Snippet: Gherkin for Clarity](#code-snippet-gherkin-for-clarity)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Welcome to the world of acronyms, where we turn simple concepts into
three-letter abbreviations to sound smarter in meetings. QA and testing
professionals must recognise these three pillars of documentation: **SRS**,
**FRS**, and **BRS**.

Without them, we are just guessing what the software is supposed to do. And
whilst "Intuition-Based Testing" sounds cool, it usually leads to a Production
Incident Report (PIR).

## TL;DR

- **BRS (Business)**: The "Why". CEO level. "We want to make money."
- **SRS (Software)**: The "What". Architect level. "We need a login system."
- **FRS (Functional)**: The "How". Developer level. "The password must be 8
  chars long."
- **No Docs?**: If you do not have requirements, you are not testing; you are
  just exploring.

## The Holy Trinity of Docs

Think of it as a hierarchy of pain:

1. **BRS**: High-level business goals.
2. **SRS**: Functional and non-functional framework.
3. **FRS**: Detailed logic, inputs, and outputs.

## SRS: The "Contract"

A **Software Requirement Specification (SRS)** is the contract between the
client and the developer. It says, "You will build X, and it will do Y."

If 'it' is not in the SRS, 'it' should not exist in the code. (In theory. In
practice, 'it' is usually a feature the CEO dreamt up in the shower this
morning).

## FRS: The "Manual"

A **Functional Requirement Specification (FRS)** is the bible for QA. It
translates "We want a fast login" (BRS) into "Login API must respond within
200ms using a JWT token" (FRS).

It covers:

- **Inputs**: Username, Password, OTP.
- **Outputs**: 200 OK + Token, or 401 Unauthorized.
- **Logic**: Lock account after 3 failed attempts.

## BRS: The "Why"

A **Business Requirement Specification (BRS)** explains why we are building this
thing in the first place.

- "Increase user retention by 5%."
- "Allow users to pay with Dogecoin (unfortunately)."

Whereas the SRS and FRS provide a roadmap for developers, the BRS provides the
budget and the motivation.

## Code Snippet: Gherkin for Clarity

We can map requirements directly to tests using Cucumber/Gherkin. This links the
FRS to the actual executable test.

```gherkin
# Requirement: FRS-1.2 (User Login)
# Business Goal: BRS-1.0 (Secure Access)

Feature: User Authentication

  @req:FRS-1.2 @critical
  Scenario: Successful login with valid credentials
    Given the user is on the login page
    When the user enters valid username "qa_ninja"
    And the user enters valid password "hunter2"
    Then the user should be redirected to the dashboard
    And a welcome message should be displayed

  @req:FRS-1.3
  Scenario: Account lockout protection
    Given the user has failed login 2 times
    When the user enters an invalid password
    Then the account should be locked for 15 minutes
```

By tagging scenarios with `@req:FRS-1.2`, we create **Traceability**. If the
client asks, "Did you test FRS-1.2?", you can point to the green checkmark.

## Summary

Never forget this fact: if we build a perfect FRS that fails the BRS, we have
built a perfect failure. We built the wrong thing, correctly.

Jim Highsmith once said, "Documentation is not understanding." True. But try
explaining that to a stakeholder when the feature does not work. Good
documentation is your insurance policy.

## Key Takeaways

- **Traceability matters**: Map your test cases to the specific FRS item.
- **Ambiguity must be rejected**: If the requirement says "The system should be
  fast", reject it. "Fast" is not a number. "Under 200ms" is a number.
- **Ask Why**: If an FRS makes no sense, check the BRS. Maybe the business goal
  changed.

## Next Steps

- **Find the BRS**: Go ask your Project Manager for the BRS of your current
  project. Watch the colour drain from their face.
- **Map It**: Take one feature and trace it: BRS -> SRS -> FRS -> Test Case.
