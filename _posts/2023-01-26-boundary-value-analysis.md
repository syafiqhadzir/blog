---
layout: post
title: 'Boundary Value Analysis: Living on the Edge'
date: 2023-01-26
category: QA
slug: boundary-value-analysis
gpgkey: EBE8 BD81 6838 1BAF
tags: ['edge-computing']
description:
  'Humans are terrible at the edges. We are great at "average" and "normal", but
  ask us to define exactly when a "child" becomes an "adult" (18? 21? When they
  pay'
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Why the Edge Matters](#why-the-edge-matters)
- [Equivalence Partitioning: The Dynamic Duo](#equivalence-partitioning-the-dynamic-duo)
- [Code Snippet: Parameterised Tests](#code-snippet-parameterised-tests)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Humans are terrible at the edges. We are great at "average" and "normal", but
ask us to define exactly when a "child" becomes an "adult" (18? 21? When they
pay their own taxes?) and things get fuzzy.

Software is the same. It loves the happy path. It crashes spectacularly when you
give it a zero, a negative number, or a string that is exactly 256 characters
long.

Enter **Boundary Value Analysis (BVA)**.

## TL;DR

- **Defects Cluster at boundaries**: Bugs love boundaries. They hide there like
  trolls under a bridge.
- **The Rule is simple**: Always test `min - 1`, `min`, `max`, and `max + 1`.
- **Efficiency is high**: BVA gives you high confidence with fewer tests.
- **Context is broad**: Applies to numbers, dates (Leap Years!), string lengths,
  and array sizes.

## Why the Edge Matters

Developers often write loop conditions like `i < 10` when they meant `i <= 10`.
That single character difference is the famous "Off-By-One" error. BVA is the
systematic process of hunting these errors.

If a field accepts values from 1 to 100:

- **Safe Zone**: 50. (Boring. Tells you nothing).
- **Danger Zone**: 0, 1, 100, 101.

Testing "50" proves the feature works. Testing "101" proves the feature is
secure.

## Equivalence Partitioning: The Dynamic Duo

BVA is almost always used with **Equivalence Partitioning (EP)**.

- **EP**: Divides data into groups (e.g., "Valid Ages" and "Invalid Ages").
- **BVA**: Picks the specific values from those groups to test.

Think of it like checking a fence. You do not shake every single panel (Testing
All Values); you just check the posts at the corners (Boundary Values). If the
corners hold, the fence holds.

## Code Snippet: Parameterised Tests

Here is how you write a BVA test in Jest using `test.each`. We are testing a
function `isValidAge(age)` where the valid range is 18 to 65.

```javascript
const isValidAge = (age) => age >= 18 && age <= 65;

describe('Age Validation Boundaries', () => {
  test.each([
    [17, false], // Below Min (Boundary - 1)
    [18, true], // Min (Boundary)
    [30, true], // Happy Path
    [65, true], // Max (Boundary)
    [66, false], // Above Max (Boundary + 1)
    [0, false], // Zero (Edge Case)
    [-1, false], // Negative (Edge Case)
  ])('when age is %i, returns %s', (age, expected) => {
    expect(isValidAge(age)).toBe(expected);
  });
});
```

This simple table covers 90% of the possible logic errors in that function. It
is beautiful.

## Summary

Precision at the edges defines the robustness of the system. By systematically
hitting the boundaries, we ensure that the logic holds firm where it is most
likely to snap.

It is living on the edge, quite literally.

## Key Takeaways

- **Do not Guess**: Use the `n-1`, `n`, `n+1` formula.
- **Data Types have boundaries too**: Boundaries exist for Strings (empty vs max
  length) and Arrays (empty vs null) too.
- **Security implications**: Buffer overflows are essentially just missed
  boundaries.

## Next Steps

- **Look at a Form**: Pick a number input in your app.
- **Test the Max**: Type the maximum allowed value. Then type `Max + 1`. Does it
  crash?
- **Try Zero**: Does it handle `0` correctly, or does it treat it as `null`?
