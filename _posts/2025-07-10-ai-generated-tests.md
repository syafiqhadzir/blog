---
layout: post
title: 'AI-Generated Tests: Who Watches the Watchmen?'
date: 2025-07-10
category: QA
slug: ai-generated-tests
gpgkey: EBE8 BD81 6838 1BAF
tags:

- ai
- qa
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Tautology Trap](#the-tautology-trap)
- [Blind Spots and Hallucinated APIs](#blind-spots-and-hallucinated-apis)
- [Code Snippet: Mutation Testing the AI](#code-snippet-mutation-testing-the-ai)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

"I told the AI to write unit tests for my API, and it gave me 100 tests! 100% Coverage!"

Great. Do they pass?

"Yes."

Do they pass if you *delete* the API code?

"..."

AI loves to write tests that pass easily. `expect(true).toBe(true)`. Very confident. Completely useless. QA's new job is
testing the *Test Suite itself*.

## TL;DR

- **False Greens deceive everyone**: Tests that never fail are tests that never test.
- **Mutation Testing proves value**: The only automated way to prove a test is useful.
- **Context windows cause amnesia**: AI forgets the mock setup halfway through the file.

## The Tautology Trap

AI often writes:

```javascript
const result = await api.getData();
expect(result).toBeDefined(); // Wow, very helpful
```

It looks green, but it verifies nothing about the *content* of the data. It is "Coverage Padding". It boosts the metrics
without reducing risk. It is the testing equivalent of eating celery—technically food, practically useless.

## Blind Spots and Hallucinated APIs

AI will hallucinate methods. `user.saveToDatabase()` (Real) vs `user.persistToCloud()` (Fabricated).

It will also assume mocks behave a certain way. "I assume the database returns a User object with an ID 1." If your mock
returns ID "1" (string), the test passes or fails based on JavaScript type coercion luck.

## Code Snippet: Mutation Testing the AI

We use **Stryker** (Mutation Testing Framework) to check if the AI's tests are tough enough.

```javascript
/*
  stryker.conf.js (Conceptual)
  Goal: Kill the mutants.
*/

// The AI wrote this test:
test('isAdult returns true for age 18', () => {
    expect(isAdult(18)).toBe(true);
});

// The Code:
function isAdult(age) {
    return age >= 18;
}

// Stryker creates a Mutant:
// Changes '>=' to '>'
function isAdult_Mutant(age) {
    return age > 18; // Now 18 returns false
}

// IF the test fails -> The Mutant is Killed -> GOOD TEST.
// IF the test passes -> The Mutant Survived -> BAD TEST.

/* 
   AI Test Failure Mode:
   The AI wrote verifyAge() but didn't check the boundary condition.
   
   QA Action:
   Review "surviving mutants" reports.
   Reject PRs with low Mutation Scores (< 80%).
*/
```

## Summary

AI generates code quantity. You provide quality.

A suite of 500 AI-generated tests that do not catch bugs is technical debt. It slows down CI and provides zero value.
Delete tests that do not kill mutants. Be ruthless.

## Key Takeaways

- **Over-mocking hides bugs**: If AI mocks the `File.save` function, the test passes even if the disk is full. Use
  integration tests where it matters.
- **Maintainability requires refactoring**: AI writes verbose, repetitive code. Refactor the tests into helpers, or your
  test suite will become unmaintainable spaghetti.
- **AI tests need extra scrutiny**: Treat AI tests with *more* suspicion than human tests, because AI has no understanding
  of "Why are we testing this?".

## Next Steps

- **Tool**: **Stryker** (JS/TS), **Pitest** (Java), **Mutmut** (Python).
- **Metric**: Stop tracking "Line Coverage". Start tracking "Mutation Score".
- **Workflow**: Use AI to *sketch* the test cases (Input vectors), then write the assertions yourself.
