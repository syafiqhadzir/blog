---
layout: post
title: 'GraphQL Schema Testing: How to Test Infinity'
date: 2023-04-13
category: QA
slug: graphql-schema-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Problem with Infinity](#the-problem-with-infinity)
- [Validation Strategies](#validation-strategies)
- [Code Snippet: Schema Diffing (The Lifesaver)](#code-snippet-schema-diffing-the-lifesaver)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

GraphQL is fantastic for frontend developers. "I want a user's name, their last 3 orders, and the GPS coordinates of their parrot." Boom, one request.

For QA engineers, it is a nightmare. Unlike REST, where you have clear endpoints (`GET /users/1`), GraphQL is one giant endpoint (`POST /graphql`) that accepts infinite variations of queries. How do you test infinity?

## TL;DR

- **Schema is King**: The Schema is your contract. Validate it against changes.
- **Breaking Changes need detection**: Removing a field is a breaking change. Renaming a field is a breaking change.
- **Authorisation needs testing**: Just because I can query `currentUser { password }` does not mean I should get a result.
- **Depth Limiting prevents attacks**: Stop hackers from nesting queries until your server explodes.

## The Problem with Infinity

In REST, a 404 is a 404. In GraphQL, everything is a 200 OK, even if the body says `"errors": ["You are not authorized"]`.

Your tests must stop checking `res.status` and start checking `res.body.errors` and `res.body.data`.

Additionally, the **N+1 problem** is notorious. If I query a list of 100 users and ask for their latest transaction, a poorly written resolver might hit the database 101 times. Performance testing is critical.

## Validation Strategies

We need to treat the Schema as a legal contract. Tools like `graphql-inspector` run in CI and compare the current schema against the main branch.

If you changed a non-nullable field to nullable (or vice versa), it screams at you. This is better than waiting for the iOS app to crash because `email` came back `null`.

## Code Snippet: Schema Diffing (The Lifesaver)

Here is a conceptual example of how to validate schema changes using `graphql-inspector` in a CI script. This runs before you even deploy.

```bash
# In your CI pipeline (GitHub Actions / GitLab CI)

# 1. Install Inspector
npm install -g @graphql-inspector/cli

# 2. Check for breaking changes
# Compares local schema file against the production endpoint
graphql-inspector diff schema.graphql https://api.mysite.com/graphql \
  --rule no-breaking-changes \
  --fail-on-breaking

# Output might look like:
# ✖ Breaking change: Field 'User.email' was removed.
# ✖ Breaking change: Type of 'Order.total' changed from 'Float' to 'Int'.
```

This simple check prevents a developer from accidentally renaming a field that the mobile app relies on, saving you from a 1-star app store review.

## Summary

GraphQL changes the contract, but the goal remains the same: ensuring that the data requested is the data delivered, securely and efficiently.

We move away from testing endpoints and move towards testing the *Graph*—the relationships between your data entities.

## Key Takeaways

- **Introspection needs disabling in prod**: Disable it in production. Please. Otherwise, you are giving attackers a map of your database.
- **Mocking is easy**: GraphQL makes mocking easy because the schema *is* the mock definition.
- **Errors need partial testing**: Test partial failures. What happens if `User` loads but `Orders` fails?

## Next Steps

- **Hack Yourself**: Try querying `__schema { types { name } }` on your prod API. If it works, file a bug.
- **Depth Limit**: Configure your server to reject queries deeper than 5 levels (`User -> Friends -> User -> Friends...`).
- **Tools**: Check out Apollo Studio or Postman's GraphQL support.
