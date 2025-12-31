---
layout: post
title: "Functional vs Non-Functional Testing: Does it Work, or Does it Suck?"
date: 2022-11-24
category: QA
slug: types-of-testing-objective
gpgkey: "D25D D0AD 3FDB F7C6"
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Functional Testing: The "What"](#functional-testing-the-what)
- [Non-Functional Testing: The "How"](#non-functional-testing-the-how)
- [The Cage Match (Comparison)](#the-cage-match-comparison)
- [Code Snippet: Doing Both at Once](#code-snippet-doing-both-at-once)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Taxonomy is boring, but essential. Software Testing is generally categorised objectively into two main camps: **Functional** and **Non-Functional**.

Think of it as buying a car.

- **Functional**: Does the engine start? Do the brakes stop the car?
- **Non-Functional**: Does it do 0-60 in 3 seconds, or does it feel like driving a washing machine full of bricks?

## TL;DR

- **Functional verifies features**: "Can I login?"
- **Non-Functional verifies behaviour**: "Can I login in under 1 second?"
- **You Need Both**: A secure app that does not work is a brick. A working app that takes 2 minutes to load is a paperweight.

## Functional Testing: The "What"

Functional testing asks the simple question: "Does this feature do what the requirement says?"

It involves validating inputs and outputs.

- **Unit Testing**: Does `add(2, 2)` return `4`?
- **Integration Testing**: Does the API save the user to the database?
- **Sanity Testing**: Did we accidentally delete the homepage?

## Non-Functional Testing: The "How"

Non-functional testing focuses on the *attributes* of the system. These include performance, reliability, security, scalability, and usability. It asks the harder question: "If 10,000 people try to buy tickets at once, will the server melt?"

Types include:

- **Performance**: Load, Stress, and Endurance testing.
- **Security**: Penetration testing (hacking yourself before someone else does).
- **Usability**: Can a human use this, or was it designed by a robot?

## The Cage Match (Comparison)

| Feature | Functional Testing | Non-Functional Testing |
| :--- | :--- | :--- |
| **Question** | "Does it work?" | "Does it work *well*?" |
| **Focus** | User Requirements | User Expectations |
| **Example** | Testing login verification | Testing login speed |
| **Timing** | Before Non-Functional | Usually after (but should be continuous) |

## Code Snippet: Doing Both at Once

Why choose? Here is how you can check both Functional (Status 200) and Non-Functional (Speed) requirements in a single K6 script.

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10, // Virtual Users (10 angry customers)
  duration: '30s',
};

export default function () {
  const res = http.get('https://test-api.k6.io/public/crocodiles/');
  
  // Functional Check: Logic
  check(res, {
    'status is 200': (r) => r.status === 200,
    'crocodiles found': (r) => r.body.includes('crocodiles'),
  });

  // Non-Functional Check: Speed
  check(res, {
    'fast enough (<500ms)': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

If the status is 200 but the duration is 5000ms, the Functional test passes, but the Non-Functional test implies your users are rage-quitting.

## Summary

You cannot be a great tester if you only focus on one side of the coin. A feature that works perfectly but takes 5 minutes to load is indistinguishable from a feature that does not work at all.

It is a bug. Mark it as one.

## Key Takeaways

- **Balance is key**: Do not neglect the "ilities" (scalability, reliability).
- **Shift Left**: Performance testing should not happen the day before Black Friday.
- **Tooling matters**: Use the right tool. Selenium is for clicking; JMeter/K6 is for hammering.

## Next Steps

- **Map Your Suite**: Look at your tests. Are they 99% functional? Balance the scales.
- **Add a Timer**: Add a simple performance assertion to your existing API tests.
- **Learn K6**: It is JavaScript. You already know it. Go break something.
