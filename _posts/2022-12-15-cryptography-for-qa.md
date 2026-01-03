---
layout: post
title: 'Cryptography for QA: Don''t Roll Your Own Crypto'
date: 2022-12-15
category: QA
slug: cryptography-for-qa
gpgkey: EBE8 BD81 6838 1BAF
tags:
- encryption
- quality-assurance
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [What is AES (Rijndael)?](#what-is-aes-rijndael)
- [Why Does QA Care?](#why-does-qa-care)
- [Code Snippet: Creating Valid Test Data](#code-snippet-creating-valid-test-data)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Cryptography usually feels like maths homework that you accidentally swallowed. But in the world of QA, specifically
when dealing with GDPR, PII (Personally Identifiable Information), and security testing, you need to know your AES from
your DES.

Enter **Rijndael** (pronounced "Rain-dull", or "Rhine-dahl" if you want to sound fancy at parties), the algorithm that
keeps the internet from being a total free-for-all.

## TL;DR

- **Rijndael = AES**: The standard for locking up data.
- **Symmetric means shared key**: The key that locks it is the key that unlocks it. Do not lose the key.
- **Test Data needs encryption**: You need to generate valid encrypted payloads for testing.
- **Never Roll Your Own**: If a developer writes their own encryption algorithm, file a bug. Immediately.

## What is AES (Rijndael)?

Rijndael is the specific algorithm selected by NIST to become the **Advanced Encryption Standard (AES)**. It replaced
DES, which was about as secure as a wet paper bag.

It is a **Symmetric Block Cipher**.

- **Symmetric**: Shared key. Like a hotel room card.
- **Block Cipher**: It chops data into 128-bit blocks and scrambles them. Imagine a Rubik's Cube of data.

## Why Does QA Care?

"I test buttons, why do I care about maths?"

1. **Test Data Management**: You cannot just dump production data into staging. You need to mask it. If you mask it with
   `base64`, you are not encrypting it; you are just wearing a fake moustache.
2. **Verification is essential**: If the requirement says "Credit Cards must be encrypted," you need to check the
database. If you see `4111 1111 1111 1111`, raise a P1. You should see `a9f8e7...`.
3. **Compliance matters**: GDPR fines are based on "reasonable protection". Storing passwords in plain text is not
reasonable.

## Code Snippet: Creating Valid Test Data

As a QA, you might need to generate valid encrypted payloads to test an API endpoint. Here is how you do it in Node.js
without needing a maths degree.

```javascript
const crypto = require('crypto');

// The Secret Key (Don't hardcode this in production, obviously)
// AES-256 requires a 32-byte key.
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32); 
const iv = crypto.randomBytes(16); // Initialisation Vector (Randomness)

function encrypt(text) {
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { 
      iv: iv.toString('hex'), 
      encryptedData: encrypted.toString('hex') 
  };
}

// QA Scenario: Mocking a "Secure" Payload
const piiData = "user@example.com";
const payload = encrypt(piiData);

console.log(`Sending to API: ${JSON.stringify(payload)}`);
// Output: {"iv":"...","encryptedData":"..."}
```

If you send this payload and the API returns 200 OK, the decryption logic works. If it returns 500, the dev probably
hardcoded the IV.

## Summary

I tried to keep this simple, but cryptography is inherently complex. However, understanding that "AES-256 is the
standard" gives you enough vocabulary to argue with developers about security requirements.

And remember: if you see custom crypto code, run away.

## Key Takeaways

- **AES is Standard**: Use it.
- **Base64 is NOT encryption**: Base64 is encoding, not encryption.
- **Verification needs checking**: Check the database. Trust, but verify.

## Next Steps

- **Audit**: Go check your Staging DB. Are the passwords hashed? (Bcrypt/Argon2).
- **Test**: Try sending an encrypted payload with the wrong Key. Does the API explicitly say "Decryption Failed" or does
  it crash?
