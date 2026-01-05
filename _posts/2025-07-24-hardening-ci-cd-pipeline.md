---
layout: post
title: 'Hardening CI/CD: The Factory Must Be Secure'
date: 2025-07-24
category: QA
slug: hardening-ci-cd-pipeline
gpgkey: EBE8 BD81 6838 1BAF
tags: ['devops']
description: 'In 2021, the SolarWinds attack changed everything.'
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Understanding Supply Chain Attacks](#understanding-supply-chain-attacks)
- [The Signed Commit Policy](#the-signed-commit-policy)
- [Code Snippet: Verifying Artifact Integrity](#code-snippet-verifying-artifact-integrity)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

In 2021, the SolarWinds attack changed everything.

Hackers did not attack the customers. They attacked the _Build System_. If your
CI/CD pipeline is compromised, you are shipping malware signed with your own
certificate. It is the ultimate betrayal of trust.

QA's responsibility now extends to "Pipeline Integrity". Is the code you
deployed actually the code you wrote?

## TL;DR

- **Least Privilege protects everyone**: The CI Runner should not have Admin
  access to AWS/GCP. It needs just enough permissions to do its job.
- **Immutable logs foil attackers**: Hackers delete logs. Send them to a WORM
  (Write Once Read Many) bucket.
- **Pin dependencies to avoid surprises**: `npm install` is a vulnerability. Use
  `npm ci`.

## Understanding Supply Chain Attacks

Attack Vector:

1. Hacker finds a weak npm package you use (e.g., `left-pad-v2`).
2. Hacker publishes a malicious update.
3. Your CI runs `npm update`.
4. Your build server steals your `AWS_ACCESS_KEY` and sends it somewhere
   unpleasant.

**QA Defence**: Test the "Lockfile". If `package-lock.json` changes
unexpectedly, fail the build and investigate.

## The Signed Commit Policy

If someone steals your GitHub password, they can commit code as you. Unless you
enforce **GPG Signing**.

Configure GitHub/GitLab to _reject_ any push that is not signed with a YubiKey
or GPG key. This proves **Identity** + **Intent**. It is the digital equivalent
of a wax seal.

## Code Snippet: Verifying Artifact Integrity

A script to ensure the Docker image we just built has not been tampered with
before push.

```javascript
/*
  verify-build.js
  Run this as the final step in CI
*/
const crypto = require('crypto');
const fs = require('fs');
const { execSync } = require('child_process');

function generateChecksum(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

try {
  console.log('🔒 Verifying Artifact Integrity...');

  // 1. Build the Artifact
  execSync('npm run build:bin');

  // 2. Generate Hash
  const hash = generateChecksum('./dist/app.bin');
  console.log(`Artifact Hash: ${hash}`);

  // 3. Sign it (Simulation of cosign/notary)
  // In real life, use: cosign sign --key cosign.key $hash
  const signature = crypto
    .createHmac('sha256', process.env.SIGNING_KEY)
    .update(hash)
    .digest('hex');

  console.log(`Signature: ${signature}`);

  // 4. Verify against known good state (Metadata)
  // ...

  console.log('✅ Artifact Verified & Signed.');
} catch (error) {
  console.error('❌ Integrity Violation!', error);
  process.exit(1);
}
```

## Summary

The pipeline is production. Treat it as such.

If you cannot trust the pipeline, you cannot trust the software. Implement SLSA
(Supply-chain Levels for Software Artifacts) Level 3. Be paranoid. Paranoia is
appropriate here.

## Key Takeaways

- **Ephemeral runners reduce attack surface**: Destroy the build server after
  every job. Do not reuse environments.
- **Secrets management is critical**: Never use `process.env` for secrets
  logging. Use Vault or AWS Secrets Manager.
- **Output verification catches tampering**: Do not just check "Did it build?".
  Check "Did it build exactly 45MB?".

## Next Steps

- **Tool**: **Cosign** (Sigstore) for signing containers.
- **Standard**: Read the **SLSA** (Salsa) framework.
- **Practice**: Audit your GitHub Actions used. Are you using
  `actions/checkout@v2` or `actions/checkout@abc12345` (SHA pinning)?
