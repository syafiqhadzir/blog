---
layout: post
title: "Ethical AI Testing: Why Your Algorithm Is Probably Racist"
date: 2025-10-02
category: QA
slug: ethical-ai-testing
gpgkey: "EBE8 BD81 6838 1BAF"
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Bias Bug](#the-bias-bug)
- [Explainability (XAI) as a Feature](#explainability-xai-as-a-feature)
- [Code Snippet: Measuring Disparate Impact](#code-snippet-measuring-disparate-impact)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

If a button on a website does not work, it is a bug. You fix it. Nobody cries.

If an AI résumé screener rejects all female candidates, it is a lawsuit, a PR nightmare, and a moral failure. The QA engineer is now the **Ethics Compliance Officer**. We do not just test "Does it work?". We test "Is it Fair?".

This domain is called **FATE** (Fairness, Accountability, Transparency, Ethics), which is appropriate because if you ignore it, you are doomed.

## TL;DR

- **Disparate impact reveals bias**: If the approval rate for Group A is 80% and Group B is 20%, you have a problem. Fix your training data.
- **Model Cards are nutrition labels**: Every model must have documentation listing its limitations. "Warning: May contain traces of 1950s sexism."
- **Red Teaming finds problems first**: Hire diverse teams to actively try to make the AI say offensive things. Better they find it than Twitter.

## The Bias Bug

Training data reflects history. History is biased. Therefore, raw models are biased. Simple transitive logic.

**QA Strategy**: **Sliced Evaluation**. Do not look at "Global Accuracy" (95%). That number is a lie designed to make you feel good.

Look at accuracy for "Subgroups". "It works 99% for English speakers, but 10% for Spanish speakers." That is not an edge case. That is a critical P0 bug affecting millions of people.

## Explainability (XAI) as a Feature

If the AI denies a loan, GDPR says the user has a "Right to Explanation". "Computer says no" is illegal. It is also infuriating.

QA must test the **SHAP (Shapley Additive Explanations)** values. "Feature 'Income' contributed +50 points. Feature 'PostCode' contributed -100 points."

If 'PostCode' is a proxy for race (which it often is), the model is discriminatory. Kill it.

## Code Snippet: Measuring Disparate Impact

Using a simple fairness metric to audit a classification model's output. Mathematics does not care about your feelings.

```javascript
/*
  fairness-audit.js
*/

// Mock Data: [Prediction (1=Hire, 0=Reject), SensitiveAttribute (Group A/B)]
const predictions = [
    { pred: 1, group: 'A' }, { pred: 1, group: 'A' }, { pred: 1, group: 'A' }, { pred: 0, group: 'A' },
    { pred: 1, group: 'B' }, { pred: 0, group: 'B' }, { pred: 0, group: 'B' }, { pred: 0, group: 'B' }
];

function calculateDisparateImpact(data) {
    const groupA = data.filter(d => d.group === 'A');
    const groupB = data.filter(d => d.group === 'B');
    
    // Calculate Selection Rate
    const rateA = groupA.filter(d => d.pred === 1).length / groupA.length;
    const rateB = groupB.filter(d => d.pred === 1).length / groupB.length;
    
    console.log(`Selection Rate Group A: ${(rateA * 100).toFixed(1)}%`);
    console.log(`Selection Rate Group B: ${(rateB * 100).toFixed(1)}%`);
    
    // Disparate Impact Ratio (DI)
    // Rule of thumb (Four-Fifths Rule): DI should be > 0.8
    const di = rateB / rateA;
    
    return di;
}

const di = calculateDisparateImpact(predictions);
console.log(`Disparate Impact Ratio: ${di.toFixed(2)}`);

if (di < 0.8) {
    console.error('❌ FAIL: Bias detected against Group B. Do not deploy.');
} else {
    console.log('✅ PASS: Model is statistically fair. (But still manually check it).');
}
```

## Summary

You cannot debug bias with a debugger. You debug it with **Statistics** and **Empathy**.

If you are building AI for the public good, your testing must be as rigorous as clinical trials. We are injecting code into society's bloodstream. The consequences of getting it wrong are measured in ruined lives, not just error messages.

## Key Takeaways

- **Data lineage matters**: Where did this training data come from? Was it scraped without consent? If so, it is poisoned fruit.
- **Feedback loops amplify bias**: If the model is deployed, does it create a self-fulfilling prophecy? (e.g., Policing algorithms sending more officers to "high crime" areas, finding more crime, reinforcing the model).
- **Human in the loop for high stakes**: For high-stakes decisions (Life/Death/Jail/Job), AI should only be a *recommendation*, never the final judge. Test the *handoff* UI.

## Next Steps

- **Tool**: **IBM AI Fairness 360** or **Google What-If Tool**. Use them.
- **Framework**: **LIME** (Local Interpretable Model-agnostic Explanations).
- **Read**: *Weapons of Math Destruction* by Cathy O'Neil. It will scare you straight.
