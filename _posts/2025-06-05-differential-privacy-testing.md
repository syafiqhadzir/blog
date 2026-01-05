---
layout: post
title: 'Differential Privacy Testing: The Art of Structured Noise'
date: 2025-06-05
category: QA
slug: differential-privacy-testing
gpgkey: EBE8 BD81 6838 1BAF
tags: ['privacy', 'security', 'philosophy']
description:
  "Q: How do you tell me the average salary of the team without telling me
  anyone's specific salary?"
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Mathematics of "Maybe"](#the-mathematics-of-maybe)
- [The Privacy Budget (Epsilon)](#the-privacy-budget-epsilon)
- [Code Snippet: Testing Noise Distribution](#code-snippet-testing-noise-distribution)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Q: How do you tell me the average salary of the team without telling me
_anyone's_ specific salary?

A: You lie a little bit.

**Differential Privacy (DP)** is the mathematical framework of adding carefully
calibrated "Noise" to a query result. It guarantees that the output is
statistically almost the same whether any _single_ individual is in the dataset
or not.

It gives every user **Plausible Deniability**. "Did I visit that website? Maybe.
The data says 'Yes', but it also says 'Yes' for 10% of people who didn't."

## TL;DR

- **Epsilon (ε) controls the trade-off**: The Privacy Loss parameter. Low ε
  (e.g., 0.1) = High Privacy / Low Accuracy. High ε (e.g., 10) = Low Privacy /
  High Accuracy.
- **Noise follows distribution**: Randomness added to the answer (Laplace or
  Gaussian distribution).
- **Privacy Budget depletes**: You cannot query the dataset forever. Eventually,
  you burn the budget and the DB locks.

## The Mathematics of "Maybe"

If I ask "How many people have cancer?" and the answer is **100**. And I know
**Mr. Smith** joined the dataset today.

If I ask again and the answer is **101**, I know **Mr. Smith has cancer**. This
is a **Differentiation Attack**.

DP prevents this by making the answer **100 ± 2**. So when Smith joins, the
answer might still be **100**, or **102**. I cannot be certain.

## The Privacy Budget (Epsilon)

Every time an analyst queries the database, they "spend" a little bit of privacy
(Epsilon). If they ask the same question 1,000 times and average the results,
they can filter out the noise and find the true value.

**QA Requirement**: Test the **Accountant**. When the budget hits 0, the API
usually returns `429 Too Many Requests` or `403 Forbidden`. The data is
"burned". No more questions.

## Code Snippet: Testing Noise Distribution

Verifying that the noise mechanism actually follows the Laplace distribution and
is not just `Math.random()`.

```javascript
/*
  dp-mechanism.spec.js
*/

// Function to generate Laplace noise
function laplace(scale) {
  const u = 0.5 - Math.random();
  return -Math.sign(u) * scale * Math.log(1 - 2 * Math.abs(u));
}

test('should produce noise with mean approx 0 (Unbiased)', () => {
  const scale = 1.0;
  let sum = 0;
  const samples = 10000;

  for (let i = 0; i < samples; i++) {
    sum += laplace(scale);
  }

  const mean = sum / samples;

  // The noise should centre around 0
  expect(Math.abs(mean)).toBeLessThan(0.1);
});

test('should enforce privacy budget limits', () => {
  const db = new PrivateDatabase({ totalEpsilon: 1.0 });

  // Cost per query: 0.2
  db.query('SELECT count(*) FROM patients', { cost: 0.2 }); // Rem: 0.8
  db.query('SELECT count(*) FROM patients', { cost: 0.2 }); // Rem: 0.6
  db.query('SELECT count(*) FROM patients', { cost: 0.2 }); // Rem: 0.4
  db.query('SELECT count(*) FROM patients', { cost: 0.2 }); // Rem: 0.2
  db.query('SELECT count(*) FROM patients', { cost: 0.2 }); // Rem: 0.0

  // Next query should fail
  expect(() => {
    db.query('SELECT count(*) FROM patients', { cost: 0.1 });
  }).toThrow('Privacy Budget Exceeded');
});
```

## Summary

Differential Privacy is not encryption. Encryption hides data from hackers. DP
hides data from _analysts_.

It allows you to use sensitive data (Health, Taxes, Voting) for public good
without sacrificing individual dignity.

## Key Takeaways

- **Utility vs. Privacy is eternal**: The eternal trade-off. You cannot have
  perfect accuracy and perfect privacy. QA must validate the "Utility Curve".
- **Composition accumulates quickly**: 5 small queries = 1 big privacy loss.
  Budgets add up.
- **Use established libraries**: Do not roll your own crypto. Do not roll your
  own DP. Use libraries like **Google DP** or **OpenDP**.

## Next Steps

- **Library**: Use **Google's Differential Privacy** libraries (C++/Go/Java).
- **Concept**: Learn about **Local Differential Privacy** (RAPPOR), used by
  Chrome to collect stats.
- **Audit**: Check if your "anonymised" data can be linked with other public
  datasets (Netflix Prize attack).
