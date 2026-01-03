---
layout: post
title: 'Data Warehouse Testing: Reducing the Swamp Factor'
date: 2024-01-11
category: QA
slug: data-warehouses-testing
gpgkey: EBE8 BD81 6838 1BAF
tags: ["data-engineering", "data-testing"]
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Garbage In, Garbage Out" Paradox](#the-garbage-in-garbage-out-paradox)
- [Tools of the Trade: dbt & Great Expectations](#tools-of-the-trade-dbt--great-expectations)
- [Code Snippet: Using dbt for Schema Tests](#code-snippet-using-dbt-for-schema-tests)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Data Warehouses (Snowflake, BigQuery, Redshift) are where good data goes to retire, and bad data goes to hide.

Everyone loves building "The Pipeline". It sounds impressive. "We are streaming 4TB of data per second!"

Cool. But if 2TB of that is `null` because a developer renamed a column from `userId` to `user_id`, your CEO's dashboard
is going to look very interesting (and by interesting, I mean incorrect).

QA in the data world is not about clicking buttons; it is about statistically validating reality.

## TL;DR

- **Count Checks catch missing data**: If Source has 1,000 rows, and Destination has 998, you have a problem.
- **Null Safety protects integrity**: Primary Keys can never be null. Ever.
- **Freshness prevents stale dashboards**: Is the data from today, or was the cron job stuck in 2023?

## The "Garbage In, Garbage Out" Paradox

Software engineers write unit tests for logic: `if (x) return y`. Data engineers rarely write tests for *data*. They
assume the upstream API will not change. This is a fatal optimism.

When testing a specific Data Warehouse, you must shift your mindset:

1. **Schema Tests**: Did the columns change?
2. **Volume Tests**: Did we suddenly get 0 rows? Or 10x rows?
3. **Distribution Tests**: Is `age` suddenly appearing as negative numbers?

## Tools of the Trade: dbt & Great Expectations

If you represent your data transformations in SQL (which you should), **dbt** (data build tool) is the standard for
testing.

It allows you to assert the state of your data *inside* the pipeline, rather than just checking the final dashboard.

Alternatively, **Great Expectations** allows for Python-based validation suites that are more complex ("Column A must be
greater than Column B 90% of the time").

## Code Snippet: Using dbt for Schema Tests

Here is a simple `schema.yml` file for a dbt project. It enforces that `user_id` is unique and not null, and that
`status` is one of a valid set.

```yaml
version: 2

models:
  - name: users
    description: "The golden user table"
    columns:
      - name: user_id
        description: "Primary key for users"
        tests:
          - unique
          - not_null

      - name: status
        description: "Account status"
        tests:
          - accepted_values:
              values: ['active', 'inactive', 'churned']
          - not_null
```

If any row violates these rules during the build, dbt will fail the pipeline. This stops bad data from reaching the
CEO's dashboard.

## Summary

Data Quality is not a "nice to have". It is the only thing standing between your company and a lawsuit (or just really
bad business advice).

Treat data pipelines like production code. Test them. CI/CD them. And please, stop using `SELECT *`.

## Key Takeaways

- **Automate validation**: Do not manually check CSVs. Use `dbt test` or write Python scripts.
- **Monitor freshness**: Set up alerts for "Freshness". If data is stale, the dashboard is lying.
- **Own Data Quality**: QA should own Data Quality, not just the Data Engineers.

## Next Steps

- **Audit**: Run a "Null Check" on all your Foreign Keys. You might be surprised.
- **Learn**: Take a look at the dbt courses (they are free).
- **Refactor**: Move those massive SQL queries out of Tableau and into a version-controlled repository.
