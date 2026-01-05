---
layout: post
title: 'User Persona Testing: QA Roleplay for Geeks'
date: 2024-07-25
category: QA
slug: user-persona-testing
gpgkey: EBE8 BD81 6838 1BAF
tags: ['qa-strategy']
description:
  'Most QA engineers test like... QA engineers. They know where the bugs are.
  They click the buttons correctly.'
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Meet "Senior Sarah" and "Hacker Harry"](#meet-senior-sarah-and-hacker-harry)
- [The "Happy Path" Fallacy](#the-happy-path-fallacy)
- [Code Snippet: Dynamic Permissions Testing](#code-snippet-dynamic-permissions-testing)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Most QA engineers test like... QA engineers. They know where the bugs are. They
click the buttons correctly.

Real users are agents of chaos. Grandma double-clicks on everything. Teenagers
spam the refresh button when the page loads too slowly.

You need to stop being you, and start being them.

## TL;DR

- **Roleplay enables empathy**: Adopt persona constraints (e.g., "I have 200ms
  reaction time" or "I am trying to steal data").
- **Data diversity matters**: Test with massive accounts ("The Power User" with
  50,000 files) and empty accounts ("The Newbie").
- **Accessibility reveals gaps**: Test with the monitor turned off (Screen
  Reader only).

## Meet "Senior Sarah" and "Hacker Harry"

**Senior Sarah**:

- Tech literacy: Low.
- Device: iPad Mini (Zoomed in 200%).
- Action: She accidentally drags a file into a folder she did not mean to. Can
  she undo it?
- QA Check: Is the "Undo" toast visible for long enough?

**Hacker Harry**:

- Tech literacy: Dangerous.
- Action: He modifies the URL ID from `123` to `124` to see if he can access
  someone else's invoice.
- QA Check: Verify IDOR (Insecure Direct Object Reference) protection. Returns
  403 Forbidden? Good.

## The "Happy Path" Fallacy

We love the Happy Path. It is clean. It works. But users live in the Sad Path.

"I lost internet whilst uploading." "I clicked 'Pay' twice because nothing
happened." "I tried to upload a 50GB video file called `image.jpg`."

Test for the sadness.

## Code Snippet: Dynamic Permissions Testing

Your automated tests can act as different personas by mocking permissions. This
is Data-Driven Testing (DDT).

```javascript
/*
  personas.spec.js
*/
const { test, expect } = require('@playwright/test');

// Define Personas
const personas = [
  { name: 'Admin', role: 'admin', canDelete: true },
  { name: 'Viewer', role: 'viewer', canDelete: false },
  { name: 'Editor', role: 'editor', canDelete: false }, // Maybe editors can't delete?
];

personas.forEach((persona) => {
  test(`As ${persona.name}, I can ${persona.canDelete ? '' : 'NOT '}delete items`, async ({
    page,
  }) => {
    // 1. Mock the user profile response to force the role
    await page.route('/api/user/me', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ role: persona.role, name: persona.name }),
      });
    });

    await page.goto('/dashboard');
    const deleteBtn = page.locator('.delete-btn');

    if (persona.canDelete) {
      // Permission exists, so button should be clickable
      await expect(deleteBtn).toBeVisible();
      await expect(deleteBtn).toBeEnabled();
    } else {
      // Permission missing, so button should be hidden or disabled
      // Note: Hiding is better security (Security by Obscurity is valid for UI)
      await expect(deleteBtn).not.toBeVisible();
    }
  });
});
```

## Summary

Persona testing adds soul to your matrix. It reminds us that there is a human on
the other side of the variable.

A confused, impatient, clumsy human. Love them. Protect them.

## Key Takeaways

- **Zoom breaks layouts**: Test your app at 150% browser zoom. Does the nav bar
  explode?
- **Touch differs from mouse**: Use Chrome DevTools "Touch Simulation". Hover
  states (`:hover`) do not exist on phones.
- **Errors need human language**: Are your error messages helpful? "Error 500"
  scares Sarah. "We couldn't save that, try again" is better.

## Next Steps

- **Tool**: Create **Test Data Factories** that generate users with specific
  attributes (e.g., `create_user(:premium, :banned)`).
- **Learn**: Read about **Inclusive Design Principles**.
- **Audit**: Watch a recording of a real user session (FullStory/LogRocket). It
  will humble you.
