---
layout: post
title: 'AI-Assisted Refactoring: Trust, but Verify'
date: 2025-07-03
category: QA
slug: ai-assisted-refactoring
gpgkey: EBE8 BD81 6838 1BAF
tags: ['artificial-intelligence']
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Hallucination Refactor](#the-hallucination-refactor)
- [The AST (Abstract Syntax Tree) Guard](#the-ast-abstract-syntax-tree-guard)
- [Code Snippet: Equivalence Checking](#code-snippet-equivalence-checking)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Developers are using Copilot, Cursor, and ChatGPT to rewrite legacy code.
"Refactor this 500-line function into a class" they say. The AI does it in 5
seconds.

**The Danger**: The AI might remove a subtle edge-case check (e.g.,
`if (user == null) return`) because it _looked_ redundant, but was actually
protecting the database from a catastrophic null pointer.

QA is no longer checking "New Features". You are checking "Old Features" that
should not have changed.

## TL;DR

- **Regression is king**: If the refactor breaks _anything_, it is a failure.
  Full stop.
- **AST Analysis reveals truth**: Do not just diff the text. Diff the
  _structure_.
- **Snapshot Testing catches drift**: Capture the I/O of the old function.
  Replay it against the new function.

## The Hallucination Refactor

AI models optimise for "Probable Tokens", not "Correct Logic".

The AI might replace a custom sorting algorithm with `.sort()`, not realising
the custom sort was doing something specific with non-ASCII characters. "It
looked redundant", the AI might say if it could speak.

**QA Strategy**: **Property-Based Testing** (Fuzzing). Run the old code 10,000
times with random inputs. Run the new code 10,000 times with the _same_ random
inputs. If `Output_Old != Output_New`, reject the commit.

## The AST (Abstract Syntax Tree) Guard

Text diffs are useless for major refactors. You need tools like **jscodeshift**
or **AST Explorer** to verify that the _intent_ of the code remains.

"Did we lose a `try/catch` block?" "Did the variable scope change?" These are
questions text diffs cannot answer.

## Code Snippet: Equivalence Checking

Using a "Golden Master" approach to verify a refactor.

```javascript
/*
  refactor-verify.spec.js
*/
const legacyCalculator = require('./legacy/calc');
const modernCalculator = require('./src/calc'); // The AI rewrite

const fastCheck = require('fast-check'); // Property based testing lib

test('modern calculator should be mathematically equivalent to legacy', () => {
  fastCheck.assert(
    fastCheck.property(
      fastCheck.integer(),
      fastCheck.integer(),
      fastCheck.constantFrom('+', '-', '*', '/'),
      (a, b, op) => {
        // Skip division by zero scenarios for this demo
        if (op === '/' && b === 0) return true;

        let oldResult, newResult;

        try {
          oldResult = legacyCalculator.compute(a, b, op);
        } catch (e) {
          oldResult = 'error';
        }

        try {
          newResult = modernCalculator.compute(a, b, op);
        } catch (e) {
          newResult = 'error';
        }

        // The Golden Rule: They must match EXACTLY
        expect(newResult).toBe(oldResult);
      },
    ),
    { numRuns: 1000 }, // Safety net
  );
});
```

## Summary

AI is the ultimate "Intern". It works fast, it is eager to please, but it makes
confident mistakes. Your job is to be the "Senior Engineer" who reviews the
Intern's PRs.

Never rubber-stamp AI code. The confidence of the response is inversely
proportional to how much you should trust it.

## Key Takeaways

- **Subtle bugs hide in refactors**: Look for off-by-one errors and lost `null`
  checks. AI hates "defensive coding".
- **Performance often degrades**: AI writes readable code, not fast code. It
  might replace a `for` loop with a `map().filter().reduce()` that allocates 3x
  memory.
- **Readability matters most**: If the AI writes code that humans cannot
  understand, revert it. Code is for humans.

## Next Steps

- **Tool**: **Fast-Check** (JS) or **Hypothesis** (Python) for property-based
  testing.
- **Learn**: Understand **ASTs** (Abstract Syntax Trees). It is how linters see
  code.
- **Process**: Implement a "No Refactor without Tests" rule. If there are no
  tests, write tests _before_ asking AI to refactor.
