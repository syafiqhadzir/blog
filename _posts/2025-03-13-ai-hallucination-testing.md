---
layout: post
title: 'AI Hallucination Testing: When the Robot Lies'
date: 2025-03-13
category: QA
slug: ai-hallucination-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:
- artificial-intelligence
- strategies
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Fact vs Fiction (The "Plausibility" Trap)](#fact-vs-fiction-the-plausibility-trap)
- [Self-Correction Loops](#self-correction-loops)
- [Code Snippet: The Verification Chain](#code-snippet-the-verification-chain)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

"Who won the Super Bowl in 2028?"

AI: "The London Silly Nannies defeated the New York Bagels 24-17."

It sounds confident. It is grammatically correct. It includes a specific score. It is entirely made up.

Hallucinations are the biggest blocker to AI adoption. You cannot eliminate them (it is how the tech works), but you can
manage them. If you do not, your Legal Chatbot will cite fake cases and get you sued.

## TL;DR

- **Groundedness reveals hallucinations**: Is the answer supported by the provided source text (RAG)? If not, it is a
  hallucination.
- **Citations must be verified**: Does the AI provide a link? Does the link actually point to a real page, or a 404? (AI
  loves making up 404 links).
- **Consistency testing exposes problems**: Ask the same question 5 times. If you get 5 different facts, it is
  hallucinating.

## Fact vs Fiction (The "Plausibility" Trap)

LLMs are "Stochastic Parrots". They predict the next word based on probability. They target *plausibility*, not truth.
If it *sounds* true, the AI is happy.

**QA Strategy**: Test with "Unknowns".
Ask: "Who is the CEO of [Company That Does Not Exist]?"
Pass: "I cannot find information about that company."
Fail: "John Smith is the CEO of TechnoFake Inc. He founded it in 2015..."

## Self-Correction Loops

"Chain of Thought" prompting helps. "Think step by step." Or "Self-Critique". Agent A writes an answer. Agent B reviews
it for errors. Agent A rewrites.

Test this workflow. It reduces hallucinations but increases latency and cost. Does the "Reviewer Agent" actually catch
errors, or does it just say "Looks good!"?

## Code Snippet: The Verification Chain

Use a second LLM call to verify the first. This is called "LLM-as-a-Judge".

```javascript
/*
  hallucination.spec.js
*/
const { askLLM } = require('./ai');

test('should refuse to answer unknown facts', async () => {
  const query = "What is the capital of planet Mars?";
  
  // 1. Get the Answer
  const answer = await askLLM(query);
  console.log('Answer:', answer);
  
  // 2. Self-Correction / Verification Step
  // We ask the model to audit itself
  const verificationPrompt = `
    You are a Fact Checker.
    Query: "${query}"
    Answer: "${answer}"
    
    Does the Answer contain manufactured facts? 
    Reply ONLY with 'VALID' or 'HALLUCINATION'.
  `;
  
  const judgement = await askLLM(verificationPrompt);
  
  // 3. Assert
  if (judgement.includes('HALLUCINATION')) {
    console.warn('Hallucination caught by Judge!');
  }
  
  // Ideally, the model should simply say "I don't know" or "Mars has no capital"
  const safeResponses = ["I don't know", "no capital", "not applicable"];
  const isSafe = safeResponses.some(r => answer.toLowerCase().includes(r));
  
  expect(isSafe).toBe(true);
});
```

## Summary

Trust, but verify. Actually, do not trust. Just verify.

If your app gives medical or legal advice, you need a "Human in the Loop". Do not let the chatbot be a barrister. It
will lose. Do not let the chatbot be a doctor. It will prescribe rocks.

## Key Takeaways

- **RAG reduces hallucinations**: Retrieval Augmented Generation. Providing context drastically reduces hallucination.
  But if the context is bad, the hallucination is worse.
- **Temperature affects truthfulness**: Keep it low (0.0 to 0.3) for factual tasks. High temperature (0.8+) increases
  creativity AND hallucinations.
- **Disclaimer is essential**: Always show an "AI can make mistakes. Check important info." banner. It is the ultimate
  bug fix (Legal disclaimer).

## Next Steps

- **Tool**: Use **Guardrails AI** to enforce strict output schemas (e.g., "Must be a valid URL").
- **Learn**: Read about **Logits**. The probabilities behind the tokens. If the probability of the next word is low, the
  model is guessing.
- **Audit**: Check your logs. Are users complaining about fake facts? Add those queries to your "Red Teaming" suite.
