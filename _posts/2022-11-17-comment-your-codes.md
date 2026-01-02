---
layout: post
title: Comment Your Code (So I Don't Have to Guess What 'Magic' Does)
date: 2022-11-17
category: QA
slug: comment-your-codes
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Self-Documenting Code" Lie](#the-self-documenting-code-lie)
- [The Three C's of Docs](#the-three-cs-of-docs)
- [Code Snippet: The Good, The Bad, and The Useless](#code-snippet-the-good-the-bad-and-the-useless)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Communication is the lubricant of the software engine. Without it, everything grinds to a halt in a screeching mess of
merge conflicts and misunderstandings.

We often hear, "Code is poetry." Well, if that is true, some of the code I review is Vogon poetry—painful, confusing,
and likely to cause an existential crisis. As a QA engineer, I spend half my life acting as an archaeologist, digging
through layers of sediment to figure out why `var x = 42` is causing the production database to weep.

## TL;DR

- **Write for Humans**: The compiler does not care about your comments, but the junior dev (and future you) definitely
  will.
- **Why > What**: Explain *why* you did the weird thing, not *what* the syntax does.
- **Lying Comments are dangerous**: A comment that contradicts the code is worse than no comment at all.
- **No TODOs in production**: Putting `// TODO: Fix this` and merging it is a crime against humanity.

## The "Self-Documenting Code" Lie

"I do not need comments; my code is self-documenting."

I hear this a lot. Usually from the same people who name variables `temp` and `stuff`. Yes, clean code is easier to
read, but code only tells you *what* is happening. It rarely tells you *why*.

Code tells me: "Retry this request 3 times."
Comments tell me: "Retry this request 3 times because the legacy billing API is flaky on Tuesdays."

One is syntax; the other is institutional knowledge.

## The Three C's of Docs

If you want your documentation (and comments) to be actually useful, aim for the Three C's:

1. **Consistency**: If you call it `user_id` in the database, do not call it `uid` in the API and `customerKey` in the
   frontend. You are sowing chaos.
2. **Completeness**: Do not just document the happy path. Document the "if this is null, the server explodes" path.
3. **Context**: Assume the reader has zero context. Because in six months, "the reader" will be you, and you will not
remember a thing.

## Code Snippet: The Good, The Bad, and The Useless

Comments should not narrate the syntax. We know what a `for` loop looks like.

**The Bad Way (Captain Obvious):**

```javascript
// Function to add two numbers
function add(a, b) {
  return a + b; // Returns the result
}

// Loop through the list
for(let i=0; i<items.length; i++) {
   // ...
}
```

**The Good Way (The Sherlock):**

```javascript
/**
 * Calculates the retry backoff duration.
 * We use exponential backoff here because the Payment Gateway 
 * aggressively rate-limits us if we spam retries.
 * 
 * @param {number} attempt - Current retry attempt (1-indexed)
 * @returns {number} Delay in milliseconds
 */
function getRetryDelay(attempt) {
  // Cap the delay at 30s to prevent the user from staring at a spinner until heat death.
  const MAX_DELAY = 30000;
  const delay = Math.pow(2, attempt) * 1000;
  return Math.min(delay, MAX_DELAY);
}
```

See the difference? The second one explains the *business constraint* (rate limits) and the *UX decision* (max delay).
It adds value.

## Summary

Commenting is an act of empathy. It is you saying to the next person, "I know this looks weird, but here is the map."

If you write code without comments, you are essentially building a labyrinth and trapping your teammates inside with a
Minotaur. Do not be that person.

## Key Takeaways

- **Context is King**: Comments should explain the invisible constraints.
- **Maintenance matters**: Update your comments when you change the code. Stale comments are traps.
- **Standards help**: Use tools like JSDoc or PyDoc so your IDE can help you.
- **Be Kind**: Write comments as if the person maintaining your code is a violent psychopath who knows where you live.
  (Thanks, John Woods).

## Next Steps

- **Audit**: Open your last PR. Did you explain the "Why"?
- **Delete**: Go find a comment that says `// checking if x is true` and delete it with extreme prejudice.
- **Refactor**: Find a magic number (like `86400`) and replace it with a named constant (`SECONDS_IN_DAY`). That is the
  best comment of all.
