---
layout: post
title: "Protobuf Schema Validation Testing: Don't Break the Client"
date: 2024-03-07
category: QA
slug: protobuf-schema-validation
gpgkey: EBE8 BD81 6838 1BAF
tags: ['qa-general']
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Breaking Change" Trap](#the-breaking-change-trap)
- [Automating the Check](#automating-the-check)
- [Code Snippet: Using Buf to Check Compatibility](#code-snippet-using-buf-to-check-compatibility)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Protobuf files (`.proto`) are contracts. If you change a contract without
telling the other party, you get sued.

In software, "getting sued" means the Android app crashes for 100,000 users
because you renamed `user_id` to `userId`.

Backward compatibility is not a "nice-to-have"; it is the law.

## TL;DR

- **Field Numbers are sacred**: Lock them in a vault. Never change them.
- **Breaking Changes are crimes**: Renaming a field is technically fine
  (binary-wise), but deleting a required field is a crime.
- **Linting catches errors**: Use `buf` or `protolint` in CI. Humans are bad at
  spotting these errors.

## The "Breaking Change" Trap

You think: "I'll just change field 3 from `int32` to `int64` to support bigger
numbers." Result: Old clients read the `int64` as a corrupted wire type and
throw a deserialisation error.

You think: "I'll delete field 2 because we don't use it." Result: You reuse
field 2 for something else next week, and old clients (who still send field 2)
corrupt the new data.

## Automating the Check

You cannot trust code review for this.

"Looks good to me" is the famous last words of a reviewer seven minutes before
an outage.

You need a CLI tool that compares `HEAD` against `main` and screams if you broke
the rules.

## Code Snippet: Using Buf to Check Compatibility

**Buf** is the modern standard for Protobuf management. It is written in Go, it
is fast, and it is ruthless.

```yaml
# buf.yaml
version: v1
breaking:
  use:
    - FILE
lint:
  use:
    - DEFAULT
```

Run this in your CI pipeline:

```bash
# Check for breaking changes against the main branch
# If this command exits with non-zero, BLOCK THE MERGE.
buf breaking --against ".git#branch=main"
```

Output example:

```text
user.proto:5:10:Field "3" on message "User" changed type from "int32" to "string".
user.proto:8:1:Field "4" on message "User" was deleted.
```

## Summary

Schema validation is the "Unit Test" of your API contract. It is boring,
unglamorous work that prevents catastrophic failures.

Be the person who says "No" to the breaking change.

## Key Takeaways

- **Reserve deleted fields**: If you delete a field, add `reserved 4;` to ensure
  nobody reuses it in the future.
- **Package Versioning enables breaking changes**: If you really need to break
  it, create `package v2;` and run them side-by-side.
- **Wire Compatibility matters**: Understand how Protobuf encodes data
  (Tag-Length-Value). The field name does not matter, only the ID.

## Next Steps

- **Install**: `brew install bufbuild/buf/buf` (or the Windows equivalent).
- **Configure**: Strict linting rules. Enforce comments on every field.
- **Educate**: Show developers how `int32` and `sint32` are encoded differently
  (ZigZag encoding).
