---
layout: post
title: 'AI Bias Testing: Preventing Your Robot from Being a Jerk'
date: 2024-02-01
category: QA
slug: ai-bias-testing
gpgkey: EBE8 BD81 6838 1BAF
tags: ['artificial-intelligence', 'ethics']
description: 'AI models are like toddlers: they repeat whatever they hear.'
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Dave" Problem](#the-dave-problem)
- [Testing for Fairness (Demographic Parity)](#testing-for-fairness-demographic-parity)
- [Code Snippet: Measuring Disparate Impact](#code-snippet-measuring-disparate-impact)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

AI models are like toddlers: they repeat whatever they hear.

If you train your hiring AI on 10 years of CVs from a male-dominated industry,
guess who it is going to hire? (Hint: It is not users named "Alice").

Bias testing is not just "Woke QA"; it is about ensuring your product actually
works for 100% of your users, not just the 50% who look like the developers.

If your face ID does not recognise people with dark skin, that is not a
"glitch". That is a P0 defect.

## TL;DR

- **Representation Bias needs auditing**: Does your training data look like the
  real world?
- **Disparate Impact needs measurement**: Does the model approve 80% of Group A
  but only 20% of Group B?
- **Adversarial Testing reveals offence**: Try to trick the AI into being
  offensive. It is surprisingly easy.

## The "Dave" Problem

I call this the "Dave" problem. If your dataset features 10,000 Daves and only 5
Sarahs, the model will learn that "Dave" is a strong feature for success.

QA needs to audit the **Training Data** before a single line of code is written.
Ask the Data Scientists: "What are the demographics of this dataset?"

If they stare at their shoes and mumble, you have a problem.

## Testing for Fairness (Demographic Parity)

We use a metric called **Disparate Impact Ratio**. If the selection rate for a
protected group is less than 80% of the highest selection rate, you generally
have a bias problem (using the "four-fifths rule").

## Code Snippet: Measuring Disparate Impact

Here is a Python function to calculate if your model is biased against a
specific group.

```python
def check_disparate_impact(group_a_pass_rate, group_b_pass_rate):
    """
    Checks for bias using the 80% rule.
    Group A: Privileged Group (e.g., Majority)
    Group B: Protected Group (e.g., Minority)
    """
    if group_a_pass_rate == 0:
        return True # Avoid division by zero

    impact_ratio = group_b_pass_rate / group_a_pass_rate

    print(f"Impact Ratio: {impact_ratio:.2f}")

    if impact_ratio < 0.8:
        print("❌ BIAS DETECTED: The model fails the 80% rule.")
        return False
    elif impact_ratio > 1.25:
         print("❌ REVERSE BIAS DETECTED? (Or sample size too small)")
         return False
    else:
        print("✅ FAIRNESS CHECK PASSED.")
        return True

# Example: Loan Approval Rates
# Men: 50% approval, Women: 30% approval
check_disparate_impact(0.50, 0.30)
# Result: 0.60 -> FAIL
```

## Summary

You would not ship a car that only turns left. Do not ship an AI that only works
for half the population.

Bias bugs are harder to fix than NullPointerExceptions because they are baked
into the maths. Catch them early, or be prepared for a PR nightmare.

## Key Takeaways

- **Audit Data first**: The bug is usually in the CSV, not the Python file.
- **Slice Your Metrics**: Do not look at global accuracy. Look at "Accuracy for
  Women" vs "Accuracy for Men".
- **Human in the Loop**: AI should aid decisions, not make them autonomously
  (especially for life-changing events like loans).

## Next Steps

- **Tooling**: Look into **IBM AI Fairness 360** (AIF360).
- **Process**: Add a "Bias Review" column to your Jira board.
- **Education**: Teach your team that "Blind" algorithms are often the most
  biased (because they find proxies for race/gender like Postcode).
