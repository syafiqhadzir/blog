---
layout: post
title: 'The Future of QA: Predictive Testing (Minority Report Style)'
date: 2025-08-28
category: QA
slug: future-of-qa
gpgkey: EBE8 BD81 6838 1BAF
tags:
- strategies
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Bug that Never Happened](#the-bug-that-never-happened)
- [Smart Test Selection](#smart-test-selection)
- [Code Snippet: Training a Defect Prediction Model](#code-snippet-training-a-defect-prediction-model)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

In Traditional QA, the workflow is painfully linear:

1. Developer writes code.
2. QA runs 10,000 tests (which takes an hour, enough time to question your life choices).
3. Test #999 fails.
4. Feedback loop: **1 Hour**.

In **Predictive QA**, we treat the repository like a crime scene before the crime happens:

1. Developer types code.
2. IDE screams: "You are editing `payment.ts`. This file is highly coupled with `invoice.ts`. The last three times this
was edited, it caused a regression in the `billing-test-suite`."
3. Feedback loop: **1 Second**.

We are not finding bugs anymore. We are predicting them. Minority Report, but with fewer wooden balls and more Python
scripts.

## TL;DR

- **Test splitting reduces waste**: Do not run all tests. Run relevant tests. If you change a CSS file, why are you
  running the database migration suite?
- **Hotspots reveal risk**: 80% of your bugs come from 20% of your weirdest files. Identify them. Mark them with a "Here
  be Dragons" sign.
- **Commit risk scoring gates merges**: Score every Pull Request from 0 (Safe) to 100 (Critical). If it is a 90, block
  the merge button.

## The Bug that Never Happened

Predictive Testing analyses:

- **Code Complexity (Cyclomatic)**: Is this function a nested hellscape of `if` statements?
- **Churn**: How often is this file edited? High churn usually means "We do not know what we want this feature to do."
- **Author History**: Is this a new intern editing a legacy core file that has not been touched since 2019? *Panic*.

If the risk is high, we block the merge **before** the tests even run. Prevention is cheaper than cure.

## Smart Test Selection

The biggest lie in DevOps is "Run All Tests On Every Commit". It is a waste of electricity and patience.

Predictive CI builds a dependency graph:
`Button.css` -> `Login.tsx` -> `LoginSpec.ts`.

If you touch `Button.css`, the CI should know to ONLY run `LoginSpec.ts`. This reduces CI time from 45 minutes to 2
minutes. You cannot beat physics, but you can cheat at mathematics.

## Code Snippet: Training a Defect Prediction Model

Here is a conceptual script using simple heuristics to identify "Risky Files". It is dirty, it is simple, and it works.

```javascript
/*
  risk-analyzer.js - Because gut feeling isn't a metric.
*/
const { execSync } = require('child_process');

function getGitHistory(file) {
    // Get last 10 commit dates for this file
    const log = execSync(`git log --format=%cd -n 10 --date=short ${file}`).toString();
    return log.split('\n').filter(Boolean);
}

function calculateRisk(file) {
    const history = getGitHistory(file);
    const churn = history.length;
    
    // Heuristic 1: If edited > 5 times in last week = High Churn
    const recentEdits = history.filter(d => isRecent(d)).length;
    
    // Heuristic 2: Lines of Code (The larger the file, the darker the demons)
    const loc = parseInt(execSync(`wc -l ${file}`).toString());
    
    let risk = 0;
    if (recentEdits > 3) risk += 50;
    if (loc > 500) risk += 30; // God Class?
    
    return risk;
}

const file = 'src/payment_gateway.js';
const riskScore = calculateRisk(file);

console.log(`File: ${file}`);
console.log(`Risk Score: ${riskScore}/100`);

if (riskScore > 75) {
    console.log('🚨 Recommendation: Require 2 Senior Reviews. Do not let the intern merge this.');
} else {
    console.log('✅ Standard Review. Go have lunch.');
}

function isRecent(dateString) {
    const date = new Date(dateString);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return date > sevenDaysAgo;
}
```

## Summary

We are drowning in tests. Many companies have 50,000+ tests that provide a false sense of security. Running them all is
unsustainable and, frankly, lazy.

Predictive QA uses Data Science to optimise the engineering process. It is the only way to scale Quality in a Monorepo
without hiring a thousand QA engineers. Work smarter, not harder. Your CI bill will thank you.

## Key Takeaways

- **Flaky tests poison the model**: The bane of Predictive QA. If a test fails randomly, the model learns noise. Fix
  flakiness first, or your model will be rubbish.
- **Repository mining reveals patterns**: Your `git log` is a goldmine of behavioural data. Mine it. It knows who breaks
  the build on Fridays.
- **Feedback loops train the model**: If the model predicts a bug, and there IS a bug, reward the model. Reinforcement
  Learning is not just for ChatGPT.

## Next Steps

- **Tool**: Look at **Launchable** or **Gradle Enterprise** for out-of-the-box Predictive Test Selection.
- **Learn**: Read about **Google's TAP (Test Automation Platform)**. They solved this problem a decade ago.
- **Measure**: Calculate "Time Saved by Skipping Tests". If you skip 50% of tests and catch 100% of bugs, you are a
  hero.
