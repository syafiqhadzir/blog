---
layout: post
title: "Blue-Green Deployment Validation: Don't Cross The Streams"
date: 2023-09-07
category: QA
slug: blue-green-deployment-validation
gpgkey: EBE8 BD81 6838 1BAF
tags: ['devops']
description:
  'Deploying to production used to be an adrenaline sport. You would upload the
  files, restart the server, and watch the error logs like a hawk whilst
  thousands of'
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Pre-Switch Panic](#the-pre-switch-panic)
- [The Database Trap](#the-database-trap)
- [Code Snippet: The Warm-Up Script](#code-snippet-the-warm-up-script)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Deploying to production used to be an adrenaline sport. You would upload the
files, restart the server, and watch the error logs like a hawk whilst thousands
of users saw a "503 Service Unavailable" page.

Blue-Green deployment changed that. Now, we have two identical environments:

- **Blue**: The live version (Old).
- **Green**: The new version (Idle).

QAs do not just test the code anymore; we test the _switch_.

## TL;DR

- **Concept**: Deploy to an idle environment ("Green"). Test it. Flip the Load
  Balancer. Zero Downtime.
- **Risk**: Database compatibility. Both Blue and Green share the _same_
  database.
- **Validation**: Smoke test the Green environment using a private URL or header
  (`X-Route-To: green`).

## The Pre-Switch Panic

The beauty of Blue-Green is that you can test "Production" without actually
being _in_ Production.

However, this leads to a false sense of security. "It works on Green!" Great,
but does Green have the same config as Blue? Did someone change the
`MAX_CONNECTIONS` on Blue last night and forget to update the Terraform script
for Green?

**QA Challenge**: Verify **Configuration Parity**. If Blue is running on a
larger instance type than Green, your performance test on Green is a lie.

## The Database Trap

This is where 90% of Blue-Green deployments fail.

You have two versions of the app code, but only **one database**. If Version 2
(Green) renames a column that Version 1 (Blue) is still using, you will break
the live site _before_ you even switch traffic.

**Rule**: All database changes must be **N-1 Compatible** (Backward Compatible).

1. Add new column.
2. Deploy code that writes to both (or reads from new).
3. ...Wait...
4. Delete old column (in the _next_ deployment).

## Code Snippet: The Warm-Up Script

Before flipping the switch, you want to make sure the Green environment is not
"cold". Here is a simple bash script to warm up the new instances and verify
they are returning 200 OK.

```bash
#!/bin/bash
# validation.sh

GREEN_URL="https://green-api.myapp.com"
EXPECTED_VERSION="v2.0.0"

echo "🔍 Checking Green Environment at $GREEN_URL..."

# 1. Check Health
# We use curl to just get the HTTP status code
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" $GREEN_URL/health)

if [ "$HTTP_STATUS" != "200" ]; then
  echo "❌ Critical: Green is returning $HTTP_STATUS. Aborting switch."
  exit 1
fi

# 2. Check Version
CURRENT_VERSION=$(curl -s $GREEN_URL/version | jq -r '.version')

if [ "$CURRENT_VERSION" != "$EXPECTED_VERSION" ]; then
  echo "❌ Version Mismatch: Expected $EXPECTED_VERSION, got $CURRENT_VERSION"
  exit 1
fi

echo "✅ Green is healthy and running $CURRENT_VERSION. Ready to swap!"
```

## Summary

Blue-Green deployment is the safety net that lets you sleep at night. It turns a
"Rollback" from a 30-minute panic into a 1-second load balancer update.

But remember: The safety net only works if you check the knots before you jump.

## Key Takeaways

- **Parity is mandatory**: Ensure Blue and Green hardware/config are identical.
  Use Infrastructure as Code (Terraform) to guarantee this.
- **Shared State needs care**: Remember they share the same DB, Cache, and S3
  buckets. Do not delete things in Green that Blue needs.
- **Warm-Up prevents cold starts**: Hit the Green endpoints to load classes into
  memory (Java/C#) before user traffic hits.

## Next Steps

- **Automation**: Add the validation script above to your Jenkins/GitLab
  pipeline as a blocking step.
- **Observability**: Ensure your logs clearly distinguish between `env=blue` and
  `env=green`.
- **Practice**: Perform a rollback in staging. If you cannot rollback instantly,
  you are not doing Blue-Green; you are just doing "Deployment Hopscotch".
