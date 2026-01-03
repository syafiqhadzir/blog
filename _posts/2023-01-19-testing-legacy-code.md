---
layout: post
title: 'Testing Legacy Code: Or How I Learned to Stop Worrying and Love the Mock'
date: 2023-01-19
category: QA
slug: testing-legacy-code
gpgkey: EBE8 BD81 6838 1BAF
tags: ["automation"]
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [What is "Legacy" Anyway?](#what-is-legacy-anyway)
- [The Seam Pattern](#the-seam-pattern)
- [Code Snippet: Creating a Seam](#code-snippet-creating-a-seam)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Legacy code. The phrase strikes fear into the hearts of developers. It brings to mind spaghetti logic, variable names
like `temp2`, and comments that say `// DO NOT TOUCH THIS OR GOD WILL KILL A KITTEN`.

But as QA engineers, we do not have the luxury of fear. We have to test it. We are the bomb disposal squad.

## TL;DR

- **Definition is brutal**: Legacy Code is simply "code without tests" (Michael Feathers).
- **No Rewrites allowed**: Do not rewrite it from scratch. You will fail.
- **Seams enable testing**: Find places to break dependencies (like database calls) to insert tests.
- **Characterisation Tests document behaviour**: Write tests that verify the *current* buggy behaviour, so you know if
  you change it.

## What is "Legacy" Anyway?

Michael Feathers, the author of *Working Effectively with Legacy Code*, defines it brutally: "**Legacy code is code
without tests.**"

It does not matter if you wrote it yesterday. If it lacks automated verification, it is legacy. Why? Because you cannot
change it with confidence. You are walking through a minefield where the mines move every time you deploy.

## The Seam Pattern

The biggest problem with legacy code is tight coupling. A `ProcessPayment` class might directly instantiate a
`ThirdPartyBankService`. To test `ProcessPayment`, you end up charging a real credit card. Not ideal for your bank
balance.

We need a **Seam**: a place where we can alter the behaviour of the programme without editing the programme itself
(much). This usually means **Dependency Injection**.

## Code Snippet: Creating a Seam

Here is how we refactor hard-to-test legacy code into something testable using the Seam pattern.

**Legacy Version (The "Hard" Way):**

```javascript
class OrderService {
  checkout(order) {
    // Tightly coupled! You can't test checkout without sending a real email.
    // If testing fails, you spam real users.
    const emailer = new EmailService(); 
    emailer.sendConfirmation(order.email);
    return true;
  }
}
```

**Refactored Version (The "Testable" Way):**

```javascript
class OrderService {
  // Dependency Injection: Pass the emailer in the constructor.
  // We created a "Seam" here.
  constructor(emailer) {
    this.emailer = emailer;
  }

  checkout(order) {
    this.emailer.sendConfirmation(order.email);
    return true;
  }
}

// Now we can test it with a fake!
test('checkout sends an email', () => {
  const mockEmailer = { sendConfirmation: jest.fn() };
  const service = new OrderService(mockEmailer);
  
  service.checkout({ email: 'test@example.com' });
  
  expect(mockEmailer.sendConfirmation).toHaveBeenCalled();
});
```

We did not change what the code does; we changed *how* it gets its friends. Now we can mock the dangerous stuff.

## Summary

Testing legacy code is an exercise in archaeology. You must carefully uncover the layers of logic before you can hope to
modernise them without breaking the system.

It is messy, unglamorous work, but it is the only way to pay down technical debt.

## Key Takeaways

- **Do not Rewrite**: Resist the urge to do a "Big Bang" rewrite.
- **Test First**: Write a test that passes *before* you change any logic. Even if the logic is wrong.
- **Inject Dependencies**: Use constructor injection to isolate the code under test.

## Next Steps

- **Find a Class**: Pick one large, scary class in your codebase.
- **Draw a Diagram**: Map out its dependencies.
- **Extract an Interface**: Create a seam for one of those dependencies (preferably the one that talks to the database).
