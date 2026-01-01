---
layout: post
title: 'Error Budgeting for QA: The Art of Allowed Screw-Ups'
date: 2023-10-12
category: QA
slug: error-budgeting-qa
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Feature vs. Stability" War](#the-feature-vs-stability-war)
- [Calculating the "Oopsie" Allowance](#calculating-the-oopsie-allowance)
- [Code Snippet: The Budget Policeman](#code-snippet-the-budget-policeman)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

In the old days, the goal of QA was "Zero Defects". This is a noble lie we told ourselves, like "I'll just watch one episode" or "I am only checking my emails on holiday".

In the modern SRE world, we accept that 100% uptime is impossible (and arguably too expensive). Enter the **Error Budget**: The precise amount of failure we are allowed to have before the reliability police (SREs) shut down the feature factory.

## TL;DR

- **Concept**: You have a "budget" of allowed errors (e.g., 0.1% of requests).
- **Consequence**: If you burn the budget on bad releases, you must stop shipping features and fix reliability.
- **QA Role**: We are the accountants. We predict budget burn before it happens.

## The "Feature vs. Stability" War

Imagine an Error Budget is your salary.

- **Features** are the cool stuff you want to buy (Video Games, Holidays).
- **Incidents** are the unexpected bills (Car repair, Parking fines).

If you spend all your money on "Move Fast and Break Things" (Releases), you will not have any left when "Reality Strikes" (Downtime).

Once your budget reaches zero, you are technically bankrupt. In engineering terms, this means **Feature Freeze**.

Product Managers hate this. Developers hate this. QA Engineers... well, we secretly love this, because it proves we were right about that flaky test.

## Calculating the "Oopsie" Allowance

Let us say your Service Level Objective (SLO) is **99.9% Availability**. That implies an **Error Budget of 0.1%**.

Over a 30-day period (43,200 minutes), you are allowed:
`43,200 * 0.001 = 43.2 minutes` of downtime.

If you blow 40 minutes of that on a single bad deployment because someone hardcoded `localhost` in production, you have 3.2 minutes left for the rest of the month. Good luck sleeping at night.

## Code Snippet: The Budget Policeman

Here is a Python script that might run fast in your CI/CD pipeline. It queries Prometheus to check if you have enough budget left to risk a deployment.

```python
import requests
import sys

# Prometheus URL
PROM_URL = "http://prometheus:9090/api/v1/query"

# SLO: 99.9% success over 30 days
# This query calculates the error rate over 30d and subtracts it from 1.
QUERY = '1 - (sum(increase(http_requests_total{status=~"5.."}[30d])) / sum(increase(http_requests_total[30d])))'

def check_budget():
    try:
        response = requests.get(PROM_URL, params={'query': QUERY})
        data = response.json()
        result = data['data']['result']
        
        if not result:
            print("⚠️ No metric data found. Deploy at your own risk.")
            return

        availability = float(result[0]['value'][1])
        # Calculate availability as a percentage
        print(f"📊 Current Availability (30d): {availability:.4%}")
        
        # Threshold Check
        if availability < 0.999:
            print("⛔ BLOCK: Error Budget Exhausted (< 99.9%)! Fix reliability first.")
            sys.exit(1)
        else:
            print("✅ PASS: You have budget to burn. Deploy away!")
            
    except Exception as e:
        print(f"❌ Failed to query Prometheus: {e}")
        sys.exit(1)

if __name__ == "__main__":
    check_budget()
```

## Summary

Error Budgets turn "Reliability" from a vague feeling into a hard currency. They align incentives: Devs want to ship, Ops want stability. The budget forces them to negotiate.

QA sits in the middle, ensuring that we do not spend the budget on avoidable bugs.

## Key Takeaways

- **Agreement on SLOs is mandatory**: Product and Engineering must agree on the SLO (e.g., 99.9%).
- **Consequences must exist**: There must be a penalty for exhaustion (Feature Freeze), otherwise, it is just a dashboard no one looks at.
- **Spend Wisely**: Spending budget on chaos engineering (learning) is better than spending it on regression bugs (mistakes).

## Next Steps

- **Define SLOs**: Start with one simple metric (e.g., HTTP 500 rate).
- **Visualise**: Put the "Remaining Budget" on a dashboard visible to Product Owners.
- **Enforce**: Use the script above to block deployments when the budget is red.
