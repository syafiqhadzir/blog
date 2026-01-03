---
layout: post
title: 'The QA Role in FinOps: Saving Money is Also Quality'
date: 2024-03-14
category: QA
slug: qa-role-finops
gpgkey: EBE8 BD81 6838 1BAF
tags:
- finops
- quality-assurance
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Zombie" Environment Effect](#the-zombie-environment-effect)
- [Spot Instances (Living Dangerously)](#spot-instances-living-dangerously)
- [Code Snippet: The Weekend Shutdown Script](#code-snippet-the-weekend-shutdown-script)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

FinOps (Financial Operations) is usually the job of someone in a suit who yells about the AWS bill.

But QA is often the biggest spender. We spin up 50 environments, run 10,000 automated tests, and store terabytes of
screenshots that nobody looks at.

If quality is "value to some person", and that person is the CFO, then saving £50k a month is a massive quality
improvement.

## TL;DR

- **Zombie Resources must die**: If a test environment has been idle for 24 hours, kill it.
- **Spot Instances save money**: Use cheap, interruptible VMs for stateless worker nodes.
- **Data Transfer is expensive**: Do not download the entire production internet to test a CSS change.

## The "Zombie" Environment Effect

I once found a "Load Test" cluster that had been running for 8 months. The load test finished in February. It was
October.

That single cluster cost more than my salary.

QA Engineers need to be "Garbage Collectors" for infrastructure. If you spin it up, you must spin it down.

## Spot Instances (Living Dangerously)

AWS Spot Instances are 90% cheaper than On-Demand. But AWS can take them back with 2 minutes' notice.

Perfect.

Your test automation *should* be robust enough to handle a node disappearing. If your tests fail because one node died,
your tests are flaky.

Use Spot for your Selenium Grid or Jmeter workers.

## Code Snippet: The Weekend Shutdown Script

Why is this not standard? If nobody is working on Saturday, why are the dev servers running?

```python
# shutdown_dev.py (Lambda function)
import boto3

def lambda_handler(event, context):
    ec2 = boto3.client('ec2')
    
    # Find all instances tagged 'Env=Dev' that are running
    filters = [
        {'Name': 'tag:Env', 'Values': ['Dev']},
        {'Name': 'instance-state-name', 'Values': ['running']}
    ]
    
    # describe_instances returns a messy nested dictionary
    instances = ec2.describe_instances(Filters=filters)
    ids = [i['InstanceId'] for r in instances['Reservations'] for i in r['Instances']]
    
    if len(ids) > 0:
        print(f"Stopping {len(ids)} instances: {ids}")
        # This doesn't delete them, just stops billing for Compute
        ec2.stop_instances(InstanceIds=ids)
    else:
        print("No Dev instances running. Good job team.")
```

*Trigger this via CloudWatch Event every Friday at 8 PM.*

## Summary

QA is the gatekeeper of resources. We simulate high load (expensive) and we create test data (expensive).

Optimising this spend proves that QA understands the *business*, not just the *code*.

## Key Takeaways

- **Tagging is mandatory**: If it does not have an `Owner` tag, delete it. No mercy.
- **Retention needs limits**: Do you really need to keep Jenkins artefacts for 3 years? 30 days is fine.
- **Serverless scales to zero**: For occasional tests, Lambda is cheaper than an EC2 instance that sleeps 90% of the
  time.

## Next Steps

- **Dashboard**: Create a "Cost per Build" metric. If a build costs £50, devs will think twice before committing
  `console.log("hello")`.
- **Policy**: Auto-nuke any branch environment that has not received a commit in 48 hours.
- **Celebrate**: When you save the company money, put it in your performance review.
