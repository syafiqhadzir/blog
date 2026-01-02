---
layout: post
title: 'The Human Factor: Why AI Needs a Babysitter'
date: 2025-12-18
category: QA
slug: human-factor
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Empathy Cannot Be Compiled](#empathy-cannot-be-compiled)
- [The "Uncanny Valley" of UX](#the-uncanny-valley-of-ux)
- [Code Snippet: The Turing Test for UI](#code-snippet-the-turing-test-for-ui)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

AI can find the bugs. AI can fix the bugs. But AI cannot tell you if the product is *annoying*.

The Human Factor in QA is about empathy, ethics, and the "Vibe Check". A bug-free application that feels like a prison
is a failed product. Nobody wants to use software that technically works but makes them feel like they're filing their
own tax return every time they log in.

## TL;DR

- **Robots lack frustration thresholds**: AI will retry a failed login a thousand times without complaining. A human
  will quit after three attempts and write a one-star review.
- **Accessibility requires lived experience**: An AI vision model can read alt-text, but it cannot tell you if the
  navigation flow is confusing for a blind user.
- **Ethics demand human judgement**: AI optimises for "Engagement". Humans must optimise for "Well-being".

## Empathy Cannot Be Compiled

We used to measure "Quality" in defects per KLOC (thousand lines of code). We should measure it in "Frowns per Hour".

**QA Strategy**: Usability testing is the new regression testing. Put the app in front of a tired person. Put the app in
front of an angry person. Observe. If they throw the phone, file a P0 bug.

I once watched a user try to complete a checkout flow whilst holding a crying baby. The app crashed. The user cried. The
baby was unimpressed. That test taught me more about usability than any Lighthouse score ever could.

## The "Uncanny Valley" of UX

Hyper-personalised AI feels creepy. "Hey Dave, I noticed you bought nappies. Are you sleeping well?" That is not
helpful—that is stalking with extra steps.

QA must draw the line between "Helpful" and "Stalker". This is not a technical bug. It is a **Design Flaw**. We are the
guardians of the user's dignity, which is a fancy way of saying we are the people who ask, "Have you considered how
weird this sounds?"

## Code Snippet: The Turing Test for UI

A conceptual check to see if the interface feels human or robotic.

```javascript
/*
  vibe-check.js
*/

// Heuristic: Robotic text is often too perfect, too repetitive.
function analyseCopy(text) {
    const forbiddenPhrases = [
        "We apologise for the inconvenience",
        "Your call is important to us",
        "As an AI language model"
    ];

    for (const phrase of forbiddenPhrases) {
        if (text.includes(phrase)) {
            return { score: 0, reason: "Corporate Speak detected" };
        }
    }

    // Sentiment Analysis (Mock)
    // Does it sound like a human wrote it?
    if (text.length > 200 && !text.includes('!')) {
         return { score: 30, reason: "Too dry. Needs emotion." };
    }
    
    return { score: 100, reason: "Passes the Vibe Check" };
}

console.log(analyseCopy("We apologise for the inconvenience. Please try again later.")); 
// Output: Corporate Speak. Fail.
```

## Summary

The heart of the machine is still a cold stone. Quality is more than code; it is the care and intention we put into
everything we build.

Be the human in the loop. Someone has to be, and the AI certainly is not volunteering.

## Key Takeaways

- **User rage is measurable**: Metrics like "Rage Clicks" (clicking the same button five times in one second) are gold.
  Monitor them religiously.
- **Inclusivity testing is non-negotiable**: Does the face detection work on dark skin? Does the voice recognition
  understand Scottish accents? AI is biased. QA must be the equaliser.
- **Joy matters**: Does using the app make you smile? If not, why are we building it?

## Next Steps

- **Book**: *Don't Make Me Think* by Steve Krug.
- **Skill**: **Psychology 101**. Understand Cognitive Load.
- **Action**: Watch a user use your app for ten minutes. Do not say a word. It will change your life.
