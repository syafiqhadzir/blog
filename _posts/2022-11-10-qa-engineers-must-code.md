---
layout: post
title: Yes, QA Engineers Must Code (and No, Git Push Doesn't Count)
date: 2022-11-10
category: QA
slug: qa-engineers-must-code
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "I Am Not a Developer" Defence](#the-i-am-not-a-developer-defence)
- [Why Ignorance is Expensive](#why-ignorance-is-expensive)
- [Code Snippet: Automation Literacy](#code-snippet-automation-literacy)
- [The PR Police](#the-pr-police)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

There is an old, dusty stereotype that QA engineers are just people who failed at being developers. This is, of course,
rubbish. But there is a grain of uncomfortable truth: modern QA requires technical chops. If you think `git push` is a
type of CrossFit workout, we need to have a serious talk.

## TL;DR

- **Read the room (and the code)**: You do not need to write the kernel, but you need to read the diff.
- **Tools are code**: Your testing tools (Playwright, K6) are code. Excel spreadsheets are not tools; they are prisons.
- **Respect comes from competence**: Developers listen to people who speak their language.
- **Independence matters**: Stop asking developers to "help you set up the data". Script it.

## The "I Am Not a Developer" Defence

It is a ludicrous lack of understanding of the concept of assurance to assign a technically illiterate person to guard
the quality of a digital masterpiece. Imagine a building inspector who does not know what a brick is. That is a QA
engineer who refuses to learn the basics of coding.

You do not need to be able to architect the entire microservices mesh. But you need to know if the foundation is made of
reinforced concrete or marshmallows.

## Why Ignorance is Expensive

If developers write code and managers write emails (so, so many emails), competent QA engineers write *solutions*.

We work at the jagged edge of technology. We have plenty of open-source tools to ease the testing process, but they are
useless to someone who cannot import a library. If you cannot script a simple data setup, you are forever reliant on a
developer to help you test their own code. That is a conflict of interest wrapped in a dependency hell.

## Code Snippet: Automation Literacy

You do not need to write the application, but you must be able to verify it reliably. Here is the difference: A manual
tester clicks a button 50 times. A coding QA writes a loop.

```typescript
// A coding QA doesn't just "check" the API; they interrogate it.
import request from 'supertest';
const api = request('https://api.staging.example.com');

describe('User API Security Audit', () => {
  it('should rudely reject unauthenticated access', async () => {
    // We speak the language of HTTP
    // Trying to access sensitive data without a token
    const res = await api.get('/users/me')
      .set('Accept', 'application/json');
    
    // Asserting the contract
    if (res.status !== 401) {
       // If this throws, we have a P0 incident.
       throw new Error(`Security Flaw! Access granted without token: ${res.status}`);
    }
    console.log('Security check passed: The door is locked.');
  });
});
```

Understanding this snippet means you understand HTTP status codes, asynchronous JavaScript, and assertion logic. It
means you are dangerous (in a good way).

## The PR Police

The concept of code review is often misunderstood. Some think it is just for developers to critique each other's
indentation. But if you think End-to-End (E2E) testing alone is sufficient, you are contributing to the "testing ice-
cream cone" of despair.

In the age of Agile and DevOps, code review is mandatory. Source code is broken into small chunks (Pull Requests). QA
needs to be in there.

1. **Risk Analysis**: Seeing *what* changed helps you know *what* to test.
2. **Early Bug Detection**: Spotting a missing `null` check in the PR saves you 4 hours of debugging a random crash
later.
3. **Comments**: You realise that comments are not just for show; they are the map to the buried treasure (or bodies).

## Summary

QA engineers must be literate enough to build static websites, write scripts, and read the code they are testing. HTML
is just fancy brackets, after all—it is not rocket science.

Do not worry, the code will not bite you, but professional irrelevance certainly will.

## Key Takeaways

- **Learn the Basics**: HTML, CSS, and basic JavaScript/Python are your sword and shield.
- **Read PRs**: You do not have to comment, but you have to look.
- **Automate everything**: If you do it twice, automate it. If you do it once, automate it anyway for the portfolio.
- **Respect is earned**: You gain immense respect from developers when you can say, "The promise is not resolving on
  line 42."

## Next Steps

- **Take a Course**: Complete a "JavaScript for Beginners" course this weekend.
- **Review a PR**: Jump into a developer's PR and ask one question about the logic. Just one.
- **Write a Script**: Automate one small task you do every day, even if it is just ordering lunch.
