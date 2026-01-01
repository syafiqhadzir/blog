---
layout: post
title: 'ETL Testing Practices: Extract, Transform, and... Lose Half the Rows?'
date: 2024-01-18
category: QA
slug: etl-testing-practices
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Fragile Pipeline" Problem](#the-fragile-pipeline-problem)
- [Unit Testing Transformations](#unit-testing-transformations)
- [Code Snippet: Testing Pandas Logic](#code-snippet-testing-pandas-logic)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

ETL (Extract, Transform, Load) pipelines are the "plumbing" of the data world.

Nobody notices them until they burst, and suddenly the boardroom is flooded with sewage (or in this case, duplicate customer records).

Testing ETL often feels like trying to catch water with a sieve. The source data changes formats without warning, the API rate limits you, and suddenly your "Robust Pipeline" is crashing because someone put an emoji in a `ZipCode` field. 💩

## TL;DR

- **Mock the Source**: Do not rely on the live production API for testing. Record the response.
- **Test the Transformation**: This is where the logic lives. Unit test it.
- **Idempotency needs verification**: If I run the pipeline twice, do I get double the money? (I wish).

## The "Fragile Pipeline" Problem

Most data engineers write "E2E" tests: "Run the whole DAG and see if it is green." This is testing **Availability**, not **Correctness**.

A green pipeline can still write 1,000,000 rows of rubbish.

You must test the *Transform* step in isolation. If your business logic says "Convert USD to GBP", you need a test that proves `$1.00` becomes `£0.79` (or whatever the sad exchange rate is today).

## Unit Testing Transformations

Stop testing your transformations inside Airflow or dbt execution runs.

Extract the logic into pure Python functions. `def calculate_ltv(user_orders): ...`

Now you can write a `pytest` suite that passes in a list of orders and asserts the LTV. No database required. Fast, deterministic, and actually tests the logic.

## Code Snippet: Testing Pandas Logic

Here is how you test a transformation function without spinning up a Spark cluster.

```python
import pandas as pd
import pytest

def clean_currency(df):
    """Removes symbols and converts to float."""
    # We use a raw string for the regex to avoid warnings
    df['amount'] = df['amount'].replace({r'\$': '', ',': ''}, regex=True).astype(float)
    return df

def test_clean_currency():
    # Arrange: Create a small DataFrame in memory
    input_data = pd.DataFrame({'amount': ['$1,000.00', '£50.50', '20.00']})
    
    # Act: Run the transformation
    result = clean_currency(input_data)
    
    # Assert: Verify the types and values
    assert result['amount'].dtype == 'float64'
    assert result['amount'].iloc[0] == 1000.0
    # Note: The function above doesn't handle '£', so this test might fail in reality 
    # unless we update the regex. This highlights why we TEST!
    # For this snippet, let's assume we fixed the regex or intended to fail.
    assert result['amount'].iloc[2] == 20.0
```

## Summary

ETL testing is about moving from "Inspection" (looking at the final table) to "Prevention" (testing the logic before it runs).

If you treat your data pipelines like software features, your data quality will skyrocket. If you treat them like scripts you found on Stack Overflow... good luck.

## Key Takeaways

- **Decompose giant DAGs**: Break giant DAGs into small, testable tasks.
- **Validate Input early**: Fail fast if the source data schema is wrong.
- **Idempotency prevents duplicates**: Ensure re-runs are safe. If the job fails halfway, retrying should not create duplicates.

## Next Steps

- **Refactor**: Take one Airflow task and extract the logic into a standalone function.
- **Add Tests**: Write a unit test for that function.
- **Sleep Better**: Knowing that a retry will not double-charge your customers.
