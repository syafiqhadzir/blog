---
layout: post
title: 'Mutation Testing Patterns: Who Tests the Tests?'
date: 2023-05-25
category: QA
slug: mutation-testing-patterns
gpgkey: EBE8 BD81 6838 1BAF
tags: ["mutation-testing"]
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Lie of Code Coverage](#the-lie-of-code-coverage)
- [Enter the Mutant](#enter-the-mutant)
- [Code Snippet: Killing a Mutant](#code-snippet-killing-a-mutant)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

We have all been there. You proudly present your Pull Request. The dashboard glows green: **100% Code Coverage**. You
feel like a god. You merge it.

Ten minutes later, Production is on fire.

How is this possible? Because **Code Coverage is a vanity metric**. It tells you which lines of code were *executed*,
not which lines were *verified*. It measures activity, not quality. To truly know if your tests are worth the
electricity they consume, you need to go a step further. You need to release the zombies. You need **Mutation Testing**.

## TL;DR

- **Coverage Lie is real**: 100% coverage can still mean 0% assertions.
- **Mutants break your code intentionally**: Tools like Stryker intentionally break your code (e.g., change `+` to `-`).
- **Survival is bad**: If your tests still pass after the code is broken, the mutant has "survived". This is bad.
- **Killing is good**: A good test should fail when the code is broken. This "kills" the mutant.

## The Lie of Code Coverage

Imagine a function that calculates a discount.

```javascript
function getPrice(price, discount) {
    if (discount > 10) {
        return price * 0.9;
    }
    return price;
}
```

And here is my "100% Coverage" test:

```javascript
test('getPrice runs', () => {
    getPrice(100, 20); // Executed line 2 and 3
    getPrice(100, 5);  // Executed line 5
});
```

Notice something? **I did not assert anything.** I just ran the code. The coverage tool sees the lines turn green and
gives me a gold star. But the logic is completely untested. I could delete the `return` statement, and the test would
still pass.

## Enter the Mutant

Mutation testing automates the process of "sabotaging" your code to see if the tests notice. A "Mutator" will scan your
code and spawn versions of it (Mutants) with slight defects.

Common mutations include:

- **Maths**: Changing `+` to `-`.
- **Logic**: Changing `>` to `>=`.
- **Conditionals**: Changing `true` to `false`.
- **Strings**: Emptying a string `""`.

If I run **Stryker** (a popular JS mutation testing tool) on the code above, it might generate a mutant that changes
`discount > 10` to `discount >= 10`. If my test input was `discount = 12`, the result is the same for both `>` and `>=`.
The mutant survives. The test is weak. To kill this mutant, I need a test case specifically for `10` (the boundary).

## Code Snippet: Killing a Mutant

Here is how you configure and run Stryker in a JavaScript project to expose these weak tests.

```json
// stryker.conf.json
{
  "mutator": "javascript",
  "packageManager": "npm",
  "reporters": ["html", "clear-text", "progress"],
  "testRunner": "jest",
  "coverageAnalysis": "perTest",
  "mutate": ["src/**/*.js"]
}
```

Running the scan:

```bash
$ npx stryker run

Mutation testing 12 files...
...
Mutant #13: Replaced > with >=
src/cart.js:4:15
- if (total > 100)
+ if (total >= 100)
STATUS: SURVIVED 🧟

Score: 78.5%
```

That "SURVIVED" message is your cue. It says: "I broke your logic, and your tests did not care."

## Summary

Mutation testing is the only way to prove your test suite is not just security theatre. It is computationally expensive
(running thousands of tests), so do not run it on every commit. Run it nightly, or on your core business logic
libraries. It converts the abstract feeling of "confidence" into a hard, cold metric.

## Key Takeaways

- **Quality over Quantity**: A suite with 100 tests that check nothing is worse than 10 tests that check everything.
- **Boundary Value Analysis is forced**: Mutation testing naturally forces you to check your boundaries (off-by-one
  errors).
- **The Score matters**: Aim for a **Mutation Score > 80%** on critical financial/logic modules. UI code can be lower.

## Next Steps

- **Install**: Add `stryker-cli` to your Node project today.
- **Analyse**: Run it on your most complex utility file.
- **Refactor**: Write the missing test cases to kill the surviving zombies.
