---
layout: post
title: 'Serverless Function Testing: There Is No Cloud, Only Other People''s Computers'
date: 2023-08-31
category: QA
slug: serverless-function-testing
gpgkey: EBE8 BD81 6838 1BAF
tags: ["serverless", "backend-testing", "devops"]
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Cold Start Freeze](#the-cold-start-freeze)
- [The LocalStack Illusion](#the-localstack-illusion)
- [Code Snippet: Mocking AWS SDK](#code-snippet-mocking-aws-sdk)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Serverless is amazing. You write a function, upload it to AWS Lambda, and magically it scales to infinity.

The problem is, testing it is a nightmare.

- You cannot run Lambda on your laptop (not easily).
- You cannot mock the entire internet.
- You cannot debug a production error because the logs are in CloudWatch, which costs £0.50 per click to view
  (exaggeration, but barely).

## TL;DR

- **Unit Tests mock the SDK**: Mock the AWS SDK. Do not call S3 from your laptop.
- **Integration Tests use LocalStack**: Use **LocalStack** to simulate AWS services locally in Docker.
- **E2E Tests use real AWS**: Deploy to a "dev" stage on real AWS. Simulators lie.

## The Cold Start Freeze

A "Cold Start" is when AWS has to find a spare server, install Linux, install Node.js, download your code, and run it.
This takes 2 seconds. Users hate waiting 2 seconds.

**QA Challenge**: Your performance tests must differentiate between "Cold Start" (P99 latency) and "Warm Start" (P50
latency). If your P99 is 5 seconds, your function is too fat. Remove heavyweight dependencies.

## The LocalStack Illusion

LocalStack is a Docker container that pretends to be AWS. It accepts S3 uploads and DynamoDB writes. It is fantastic for
feature testing. It is useless for IAM testing.

LocalStack will gladly let you write to a bucket without permission. Real AWS will scream `403 Access Denied`.

**Rule**: Trust LocalStack for logic, trust AWS for permissions.

## Code Snippet: Mocking AWS SDK

To unit test a Lambda function without paying Jeff Bezos, act like the AWS SDK does not exist. Using `aws-sdk-mock` is
the old way; let us adhere to modern Jest mocks with the V3 SDK.

```javascript
/* 
  Modern AWS SDK v3 Mocking using 'aws-sdk-client-mock'
  This is cleaner than the old aws-sdk-mock
*/
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { handler } from './handler';

const s3Mock = mockClient(S3Client);

beforeEach(() => {
  s3Mock.reset();
});

test('should upload report to S3', async () => {
    // 1. Mock the S3 response
    s3Mock.on(PutObjectCommand).resolves({
        ETag: '12345',
    });

    // 2. Run the Lambda handler
    const response = await handler({ body: 'test-data' });

    // 3. Assert calling arguments
    expect(s3Mock.calls().length).toBe(1);
    const callArgs = s3Mock.call(0).args[0].input;
    expect(callArgs.Bucket).toBe('my-bucket');
    expect(callArgs.Key).toBe('report.json');

    expect(response.statusCode).toBe(200);
});
```

## Summary

Serverless testing requires a "Test Pyramid" shift.

- **Lots of Unit Tests** (Fast, Cheap).
- **Some LocalStack Tests** (Medium, Checks Integration).
- **Few Real Cloud Tests** (Slow, Expensive, Checks IAM/Limits).

If you try to spin up a real CloudFormation stack for every PR, your CI bill will bankrupt the startup.

## Key Takeaways

- **Timeouts need adjustment**: The default Lambda timeout is 3 seconds. Your DB query takes 4 seconds. Crash.
- **Memory affects CPU speed**: Increasing RAM also increases CPU speed in Lambda. Sometimes paying more is cheaper
  because it runs faster.
- **Concurrency has limits**: AWS has a limit (default 1,000 parallel executions). If you DDoS your own API, you will
  get throttled.

## Next Steps

- **Tooling**: Install `serverless-offline` plugin if you use the Serverless Framework.
- **Observability**: Add a wrapper like Lumigo or Datadog Lambda Layer to see *inside* the execution.
- **Clean Up**: Write a script to delete old S3 buckets from your test runs.
