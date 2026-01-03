---
layout: post
title: 'Privacy-Preserving Analytics: I Know What You Did Last Summer (Mathematically)'
date: 2025-05-22
category: QA
slug: privacy-preserving-analytics
gpgkey: EBE8 BD81 6838 1BAF
tags:
- privacy
- strategies
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Differential Privacy (DP)](#differential-privacy-dp)
- [Homomorphic Encryption (Maths on Secret Data)](#homomorphic-encryption-maths-on-secret-data)
- [Code Snippet: Epsilon Budget Testing](#code-snippet-epsilon-budget-testing)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Analytics are great. Spying is bad.

How do we count how many users "Like Cats" without knowing *precisely* which user likes cats? Enter **Privacy-Preserving
Analytics**. We add noise effectively.

**QA Challenge**: If the noise is too random, the analytics are useless. If the noise is too weak, we leak user secrets.
It is a balance between **Utility** and **Privacy**.

## TL;DR

- **Epsilon (ε) controls privacy**: The "Privacy Budget". Lower is better privacy, but worse accuracy. If ε is too high
  (>10), it is fake privacy.
- **K-Anonymity protects individuals**: Can you distinguish 1 person in a crowd of K? (e.g., "There are 5 people with
  Postcode SW1A and birth year 1990").
- **Re-identification Attacks are real**: Combining "Anonymous" data (Film Ratings) with public data (IMDb timestamps)
  to detect "Alice".

## Differential Privacy (DP)

Idea: The output of the query should be roughly the same whether YOU are in the database or not. We add **Laplace
Noise** to the count.

True Count = 100 -> DP Count = 102.
True Count = 10,000 -> DP Count = 10,005.

For big data, the noise (Error ~ √N) does not matter. For small data, it hides the individual.

**QA Strategy**: Attack your own dataset. If "Alice" leaves the database, does the average change significantly? It
should not.

## Homomorphic Encryption (Maths on Secret Data)

Encrypt the data. Send it to the cloud. The cloud does maths on the *encrypted* data. The cloud returns an encrypted
result. You decrypt it. The cloud never sees the raw data.

Magic? No, clever algebra: Enc(A) + Enc(B) = Enc(A+B).

**QA Challenge**: Performance. This is 1,000x slower than normal maths. Test latency. Does a simple "SUM" take 5
seconds?

## Code Snippet: Epsilon Budget Testing

Ensuring we do not query the database too many times. Every query leaks a tiny bit of information. Once the budget is
gone, the DB must shut up.

```javascript
/*
  privacy-budget.spec.js
*/
const { DPDatabase } = require('./privacy-lib');

test('should block queries when privacy budget is exhausted', () => {
    // Epsilon Budget = 1.0 (Strict)
    const database = new DPDatabase({ epsilonBudget: 1.0 });
    
    // Query 1: Cost 0.4
    database.query('SELECT count(*) WHERE age > 25');
    expect(database.getRemainingBudget()).toBeCloseTo(0.6);
    
    // Query 2: Cost 0.4
    database.query('SELECT count(*) WHERE age > 30');
    expect(database.getRemainingBudget()).toBeCloseTo(0.2);
    
    // Query 3: Cost 0.4 (Over budget)
    // The database should verify budget BEFORE executing
    expect(() => {
        database.query('SELECT count(*) WHERE age > 35');
    }).toThrow('PRIVACY_BUDGET_EXCEEDED');
    
    // Alice is safe. The attacker cannot narrow down significantly.
});
```

## Summary

Data is toxic waste. Do not store what you do not need.

If you must store it, salt it, hash it, encrypt it, and noise it up. The best way to prevent a data breach is to have no
data to breach.

## Key Takeaways

- **Aggregate, do not inspect**: Never look at row-level data. Look at histograms.
- **Federated Learning keeps data local**: Train the AI on the user's phone. Only upload the *gradients* (weights), not
  the raw photos.
- **Compliance is mandatory**: GDPR is not a suggestion. It is a "fines management framework". 4% of Global Turnover
  hurts.

## Next Steps

- **Tool**: Use **Google Differential Privacy Library** (C++/Go/Java). It handles the maths properly (floating point
  vulnerabilities are real).
- **Learn**: Read about **The Netflix Prize** privacy fiasco. They thought removing names was enough. It was not.
- **Audit**: Check your query logs. Are you logging PII (Emails) in the URL params? Stop that. `GET
  /user?email=dave@boss.com` is a sin.
