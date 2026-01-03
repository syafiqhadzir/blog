---
layout: post
title: 'Vector Database Testing: Finding Needles in Hyper-Space'
date: 2025-02-27
category: QA
slug: vector-db-testing
gpgkey: EBE8 BD81 6838 1BAF
tags: ['artificial-intelligence', 'data-testing', 'emerging-tech']
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [RAG and Relevance](#rag-and-relevance)
- [The "Lost in the Middle" Phenomenon](#the-lost-in-the-middle-phenomenon)
- [Code Snippet: Precision vs Recall](#code-snippet-precision-vs-recall)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Vector Databases (Pinecone, Chroma, Milvus, Weaviate) store "Meanings", not just
keywords. You search for "Dog", it finds "Puppy", "Canine", and "Good Boy".

**QA challenge**: Did it find the _best_ Puppy? Or did it return a "Hot Dog"
because the maths was lazy and the semantic distance was close?

Testing Vector Search is testing the "Vibes" of your data.

## TL;DR

- **Embeddings are vectors**: Text converted to lists of floating-point numbers
  (e.g., `[0.1, 0.5, -0.9]`).
- **Distance reveals similarity**: Measured by Cosine Similarity. 1.0 = Exact
  Match. 0.0 = Totally Unrelated.
- **Chunking strategy matters**: How you split the text matters. Too small
  (Sentence) = no context. Too big (Chapter) = noise.

## RAG and Relevance

Retrieval Augmented Generation (RAG) fetches documents and feeds them to the
LLM. If the retrieval is bad (Garbage In), the answer is bad (Garbage Out).

**QA Strategy**: Test the Retrieval independently of the Generation. Query:
"Return policy". Expected: `policy.pdf` (Rank 1). Actual:
`employee_handbook.pdf` (Rank 1). -> **FAIL**.

The LLM cannot hallucinate the correct return policy if you fed it the lunch
menu.

## The "Lost in the Middle" Phenomenon

LLMs pay attention to the start and end of the context window. They tend to
ignore the middle.

If your Vector DB returns 20 documents, and the answer is hidden in Document
\#10, the LLM might miss it. Test different `top_k` values (e.g., 5 vs 10 vs 20).
Sometimes, less context is better.

## Code Snippet: Precision vs Recall

Measure the retrieval quality using standard Information Retrieval metrics.

```javascript
/*
  search-eval.spec.js
*/
const { vectorDb } = require('./db');

test('should retrieve relevant documents for "refund"', async () => {
  const query = 'How do I get a refund for a broken item?';

  // topK: How many results to fetch
  const results = await vectorDb.query(query, { topK: 3 });

  const ids = results.map((r) => r.metadata.doc_id);
  const scores = results.map((r) => r.score);

  console.log('Retrieved:', ids);
  console.log('Scores:', scores);

  // Assertion 1: Recall (Did we find the right doc?)
  // We expect the refund-policy doc to be present
  expect(ids).toContain('doc-refund-policy-v2');

  // Assertion 2: Relevance Score (Cosine / Euclidean)
  // 0.8 is usually a high confidence match
  expect(results[0].score).toBeGreaterThan(0.8);

  // Assertion 3: Noise check
  // We should NOT find the "Hiring" policy
  expect(ids).not.toContain('doc-hiring-policy');
});
```

## Summary

Vector Search is fuzzy. 100% precision is impossible.

Aim for "Good Enough" and tune your chunking strategy. If users say "The search
sucks", blame the chunk size (or the embedding model), not the database.

## Key Takeaways

- **Hybrid Search improves results**: Combine Vector Search (semantic) with
  Keyword Search (BM25 - exact match). It usually performs better (Reciprocal
  Rank Fusion).
- **Metadata Filtering needs testing**: Ensure filters (e.g., `category: shoes`)
  work correctly with vector queries. (Pre-filtering vs Post-filtering
  performance).
- **Reindexing is required on model change**: If you change the embedding model
  (e.g., `ada-002` to `text-embedding-3`), the vectors change dimensions. You
  must reindex everything.

## Next Steps

- **Tool**: Use **Ragas** (RAG Assessment) framework to score your retrieval
  (Context Precision, Context Recall).
- **Learn**: Understand **HNSW** (Hierarchical Navigable Small World) algorithm.
  It is the magic graph structure that makes vector search fast.
- **Audit**: Check your dimension count. 1536 dims (OpenAI) vs 768 dims
  (HuggingFace). Mismatch = Crash.
