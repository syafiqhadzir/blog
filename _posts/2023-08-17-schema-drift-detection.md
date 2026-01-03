---
layout: post
title: 'Schema Drift Detection: When Your API Ghosts You'
date: 2023-08-17
category: QA
slug: schema-drift-detection
gpgkey: EBE8 BD81 6838 1BAF
tags:
- quality-assurance
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Silent Killer](#the-silent-killer)
- [Contract Testing 101](#contract-testing-101)
- [Code Snippet: Validating with Ajv](#code-snippet-validating-with-ajv)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Documentation is like a New Year's Resolution: It starts with good intentions and is abandoned by February.

Your API docs say the `user.age` field is an `integer`. Your Backend Developer changes it to a `string` ("21 years old")
because "it looks nicer in the JSON". Your iOS app crashes instantly because it tried to do maths on a string.

This divergence between *Expectation* (Docs) and *Reality* (Response) is called **Schema Drift**. And it is the reason
your mobile team hates your backend team.

## TL;DR

- **Drift is divergence**: A mismatch between the deployed API and the consumer's understanding of it.
- **Breaking Changes cause crashes**: Removing fields or changing types (e.g., Integer -> String).
- **Green Tests hide problems**: Unit tests pass because everyone mocks the other side. Integration tests expose the
  truth.

## The Silent Killer

The problem with schema drift is that unit tests pass.

- Backend Team: "My unit tests pass!" (They mocked the DB).
- Frontend Team: "My unit tests pass!" (They mocked the API).

Everyone is green. Production is on fire.

You need **Contract Tests** or **Schema Validation** running against the *real* staged environment.

## Contract Testing 101

You do not need a heavy tool like Pact for everything. Often, a simple JSON Schema validation in your E2E suite is
enough.

Every time your test fetches a User, validate the structure against a strict schema. If `user.id` is missing, **fail the
test**. If `user.email` is not an email format, **fail the test**.

## Code Snippet: Validating with Ajv

Here is a Jest test using `ajv` (Another JSON Schema Validator) to enforce schema strictness.

```javascript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import axios from 'axios';

const ajv = new Ajv({ 
    allErrors: true, 
    strict: true 
});
addFormats(ajv);

const userSchema = {
  type: 'object',
  required: ['id', 'email', 'createdAt'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    email: { type: 'string', format: 'email' },
    name: { type: 'string', minLength: 2 },
    role: { type: 'string', enum: ['ADMIN', 'USER'] },
    createdAt: { type: 'string', format: 'date-time' }
  },
  // Controversial but effective: Ban extra fields!
  // If the backend adds 'middleName', this test fails until we update the schema.
  additionalProperties: false 
};

test('GET /users/1 matches strict schema', async () => {
    const res = await axios.get('https://api.staging.com/users/1');
    
    const validate = ajv.compile(userSchema);
    const valid = validate(res.data);

    if (!valid) {
        console.error('Schema Drift Detected:', validate.errors);
    }
    
    expect(valid).toBe(true);
});
```

Using `additionalProperties: false` ensures you are aware of every change in the payload. It is strict, but it stops
"data pollution" where valid but undocumented fields creep into your app logic.

## Summary

Schema Drift is inevitable in agile teams. The goal is not to stop changes; it is to detect them *before* the mobile app
update is approved by Apple.

If you rely on "Backend promised they wouldn't change it," you are going to have a bad time. Backend devs lie. (Not on
purpose, but they do).

## Key Takeaways

- **Strictness catches pollution**: Use `additionalProperties: false` in test schemas to catch "pollution".
- **Formats validate content**: Validate strings are actually emails, UUIDs, or ISO dates.
- **CI/CD runs validation**: Run these schema checks on every deployment to Staging.

## Next Steps

- **Generate**: Use `typescript-json-schema` to auto-generate schemas from your TypeScript interfaces.
- **Monitor**: Run a "Canary" test every hour that just validates the schema of critical endpoints.
- **Alert**: Slack the Backend channel immediately when a field disappears.
