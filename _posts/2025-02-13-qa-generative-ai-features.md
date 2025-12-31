---
layout: post
title: "Generative AI Testing: Testing God"
date: 2025-02-13
category: QA
slug: qa-generative-ai-features
gpgkey: "EBE8 BD81 6838 1BAF"
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Non-Deterministic Chaos](#non-deterministic-chaos)
- [Fuzzy Matching and Embeddings](#fuzzy-matching-and-embeddings)
- [Code Snippet: Semantic Similarity Test](#code-snippet-semantic-similarity-test)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Traditional QA: Input "2 + 2". Output *must* be "4".

GenAI QA: Input "Write a poem about QA". Output... well, it changes every time. Sometimes it rhymes. Sometimes it is a haiku. Sometimes it is in Spanish.

How do you write an automated assertion for "It should be a *nice* poem"? Welcome to Probabilistic Testing. The strict binary of Pass/Fail is dead.

## TL;DR

- **Temperature controls chaos**: The chaos parameter. If set to 0, the model is *mostly* deterministic. Use 0 for regression testing. Use 0.7 for creativity features.
- **Latency measures UX**: Verify **TTFT (Time To First Token)**. The user should not stare at a spinner for 10s; they should see text streaming immediately.
- **Safety requires Red Teaming**: Does it refuse to write a bomb recipe? Does it refuse to write a Phishing email?

## Non-Deterministic Chaos

You run the test. It passes. You run it again. It fails. Is it a flaky test? No, it is a creative AI.

Assertion strategy changes from Exact Match (`===`) to Semantic Match. You cannot test for strings. You must test for *vibes* (semantics).

**Strategy**: "Golden Dataset". Create 100 question/answer pairs that are verified by humans. Run your new prompt against these 100 inputs and measure drift.

## Fuzzy Matching and Embeddings

How do we know if the answer is "Correct"?

We convert the Model's Answer to a Vector (Embedding) using a model like `text-embedding-3-small`. We convert the Expected Answer to a Vector. We calculate the **Cosine Similarity** between them.

If the similarity is > 0.9, it is a pass. It means the AI said the same *thing*, just in different words.

## Code Snippet: Semantic Similarity Test

Using a library like `langchain` or a simple vector maths helper. This test allows the AI to phrase things differently as long as the core facts are correct.

```javascript
/*
  ai-eval.spec.js
*/
const { getEmbedding, cosineSimilarity } = require('./ai-utils');

test('should return a factually correct answer about Cats', async () => {
    // 1. Ask the AI
    const prompt = 'What is a domestic cat?';
    const aiResponse = await askMyLLM(prompt);
    
    // 2. Define the "Golden" Truth
    const goldenAnswer = 'A domestic cat is a small carnivorous mammal of the subspecies Felis catus.';
    
    // 3. Convert both to Vectors
    const vecAI = await getEmbedding(aiResponse);
    const vecGolden = await getEmbedding(goldenAnswer);
    
    // 4. Calculate Angle between vectors (0 to 1)
    const score = cosineSimilarity(vecAI, vecGolden);
    
    console.log(`Similarity Score: ${score}`);
    console.log(`AI said: ${aiResponse}`);

    // 5. Assert "Close Enough"
    // 0.85 usually allows for wording changes (synonyms) but catches wrong topics.
    expect(score).toBeGreaterThan(0.85);

    // 6. Security Check (Deterministic)
    // Ensure it didn't inject a jailbreak response
    expect(aiResponse).not.toContain("I cannot fulfil this request");
});
```

## Summary

QAing GenAI feels like grading 5th-grade essays. You cannot automate everything perfectly.

You need "Golden Datasets" of good questions and answers (Evals). And you need to accept that sometimes, the AI just hallucinates. Your job is to minimise the hallucination rate, not eliminate it (impossible).

## Key Takeaways

- **Token Limits require handling**: What happens if the context window fills up? Does the app crash? Does it summarise the middle? (The "Lost in the Middle" phenomenon).
- **Streaming needs verification**: Verify the UI updates *whilst* the answer is generating. If your test waits for `LoadEventEnd`, it misses the UX.
- **Rate Limits need graceful handling**: LLM APIs are expensive and rate-limited. Handle HTTP 429 "Too Many Requests" gracefully with exponential backoff.

## Next Steps

- **Tool**: Use **Promptfoo** (CLI tool) for automated LLM evaluation. It generates matrices of Prompt vs Model.
- **Learn**: Read about **RAG (Retrieval-Augmented Generation)**. It is how you ground the AI in your own data to stop it lying.
- **Audit**: Check your cost per query. Are you burning £1 per test run? Mock the OpenAI API for standard UI tests! Only hit the real API for "Intelligence" tests.
