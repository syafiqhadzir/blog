---
layout: post
title: 'Exploratory Testing in DevOps: Structured Vandalism'
date: 2023-02-23
category: QA
slug: exploratory-testing-devops
gpgkey: EBE8 BD81 6838 1BAF
tags:
- devops
- exploratory-testing
- quality-assurance
- testing
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Exploration vs Scripting](#exploration-vs-scripting)
- [The Charter Method](#the-charter-method)
- [Code Snippet: The Chaos Script](#code-snippet-the-chaos-script)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Automation is great at catching regressions—the bugs we already know about. But automation is terrible at catching the
"Unknown Unknowns".

It will not tell you that the "Submit" button looks weird on an iPad, or that the app crashes if you click "Save"
repeatedly whilst losing Wi-Fi.

That is where **Exploratory Testing** comes in. It is not "playing around" or "monkey testing". It is structured,
intellectual vandalism.

## TL;DR

- **Not Random at all**: Use "Charters" to define your mission.
- **Context is King**: A human notices that the UI "feels" slow; a script only checks if it loaded in <2s.
- **Timebox sessions**: 30-minute sessions. Any longer and you lose focus.
- **Tools assist chaos**: Use Fiddler/Charles to mess with the network.

## Exploration vs Scripting

Scripted testing is like a train on tracks: safe, predictable, and does not go anywhere new. Exploratory testing is off-
roading. You are the driver, and you decide where the risks are.

In DevOps, we often think everything must be automated. But a human exploring the system for 30 minutes can often find
more critical issues than a suite of 500 tests running for an hour. Why? Because the human understands *intent*.

## The Charter Method

Do not just click randomly. Use a Charter. A charter defines the mission.

> **Charter**: Explore the Checkout flow with a new user account to discover
> security vulnerabilities related to session timeouts.

This focuses your brain. You are not just "testing checkout"; you are hunting for a specific species of bug
(Security/Session).

## Code Snippet: The Chaos Script

Sometimes exploration needs a little help from automation. Here is a "Gremlin" script using Puppeteer (or Playwright) to
click wildly on a page. We call this "Fuzz Testing".

```javascript
import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://staging.myapp.com');

  // Inject a Gremlin script to click wildly
  // This library (gremlins.js) randomly clicks buttons, fills forms, and causes havoc.
  await page.addScriptTag({ 
    url: 'https://unpkg.com/gremlins.js' 
  });

  console.log('Release the Kraken!');
  
  // Unleash 1000 random interactions
  await page.evaluate(() => {
    gremlins.createHorde({
      species: [
        gremlins.species.clicker(),
        gremlins.species.formFiller(),
        gremlins.species.typer()
      ],
      mogwais: [
        gremlins.mogwais.alert(), // Handle alert popups
        gremlins.mogwais.fps()    // Monitor performance
      ]
    }).unleash();
  });

  // Watch the chaos for 30 seconds
  await new Promise(r => setTimeout(r, 30000));
  await browser.close();
})();
```

If your app crashes, freezes, or throws a React "White Screen of Death" during this run, you have found a robustness
issue that standard "Happy Path" tests would never catch.

## Summary

Exploratory testing is the thinking part of QA. It is where you use your intuition, creativity, and sadism to break the
software in ways the developers never anticipated.

It complements automation; it does not replace it.

## Key Takeaways

- **Timebox It**: Set a timer. When it rings, stop.
- **Record It**: Use screen recording (OBS or Loom). It is impossible to reproduce a weird bug from memory ("I think I
  clicked the back button twice?").
- **Debrief**: Share your findings immediately.

## Next Steps

- **Charter**: Pick a feature you have not touched in a while. Write a Charter.
- **Intercept**: Install Charles Proxy or Fiddler. Modify a response to return 500. See if the UI handles it.
- **Gremlins**: Run the script above on your Staging environment (NOT Production).
