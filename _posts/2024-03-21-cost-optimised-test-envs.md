---
layout: post
title: 'Cost-Optimised Test Environments: How to Not Bankrupt Your Startup'
date: 2024-03-21
category: QA
slug: cost-optimised-test-envs
gpgkey: EBE8 BD81 6838 1BAF
tags:
- strategies
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Zombie" Infrastructure](#the-zombie-infrastructure)
- [Spot Instances: High-Stakes Gambling](#spot-instances-high-stakes-gambling)
- [Code Snippet: The "Grim Reaper" Script](#code-snippet-the-grim-reaper-script)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Your CFO hates you. Why? Because you left a `c5.4xlarge` Kubernetes cluster running over the weekend to test "Hello
World".

Cloud bills are the silent killer of tech startups. And QA environments are usually the biggest offenders because nobody
"owns" them.

"I thought Dave was using it."
"Dave left the company 6 months ago."

## TL;DR

- **Kill switches save money**: If it is 7 PM on a Friday, your staging environment should be dead (unless you are
  Netflix).
- **Spot Instances are cheaper**: Use AWS Spot Instances for test runners. They are 90% cheaper.
- **Data Retention needs limits**: Do you really need 5 years of test logs? No. `rm -rf`.

## The "Zombie" Infrastructure

A "Zombie" server is one that is running, billing you £0.40/hour, and doing absolutely nothing.

In a microservices architecture, this compounds. One "Stage" might be 50 containers. If you have 10 devs and each has a
"Dev Env", that is 500 containers.

If those are running 24/7, you are literally setting money on fire.

## Spot Instances: High-Stakes Gambling

For CI/CD runners (Jenkins, GitHub Actions), never use On-Demand instances. Use Spot Instances.

The catch? AWS can reclaim them with 2 minutes notice.

**QA Challenge**: Ensure your test runner can "Checkpoint and Resume". If a 2-hour E2E suite dies at 1h 59m, that is not
savings; that is frustration.

## Code Snippet: The "Grim Reaper" Script

Here is a Python script using `boto3` to find and stop EC2 instances tagged as "Dev" that are still running after 7 PM.

```python
import boto3

def lambda_handler(event, context):
    ec2 = boto3.resource('ec2')
    
    # Filter for running instances tagged 'Environment: Dev'
    instances = ec2.instances.filter(
        Filters=[
            {'Name': 'instance-state-name', 'Values': ['running']},
            {'Name': 'tag:Environment', 'Values': ['Dev']}
        ]
    )
    
    stopped_count = 0
    
    for instance in instances:
        # Check bypass tag (for those who work late)
        bypass = False
        for tag in instance.tags:
            # We respect the "DoNotDisturb" tag. We are not monsters.
            if tag['Key'] == 'DoNotDisturb' and tag['Value'] == 'True':
                bypass = True
        
        if not bypass:
            print(f"💀 Grim Reaper killing instance: {instance.id}")
            instance.stop()
            stopped_count += 1
            
    return f"Stopped {stopped_count} zombies. You're welcome, CFO."
```

## Summary

QA is not just about Quality Assurance; it is about **Quality Efficiency**. If your test suite costs £10,000 to run,
nobody will run it.

Make testing cheap, and developers will do it more often.

## Key Takeaways

- **Tagging Strategy is mandatory**: You cannot manage what you cannot measure. Tag EVERYTHING (`Owner`, `Team`,
  `Expiry`).
- **Data Transfer is expensive**: AWS charges for data leaving the region. Do not download 5TB of logs to your laptop.
- **Serverless scales to zero**: For low-traffic preview environments, Lambda/Fargate scales to zero. Zero usage = Zero
  cost.

## Next Steps

- **Tool**: Use **Infracost** to see the price of your Terraform PRs before you merge `aws_instance.massive_gpu_node`.
- **Learn**: Read about **FinOps** principles.
- **Audit**: Check your S3 buckets for "mp3 collections" from 2015.
