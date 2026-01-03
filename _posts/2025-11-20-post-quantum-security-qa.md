---
layout: post
title: 'Post-Quantum Security for QA: The Apocalypse is Scheduled'
date: 2025-11-20
category: QA
slug: post-quantum-security-qa
gpgkey: EBE8 BD81 6838 1BAF
tags:
- quality-assurance
- quantum
- security
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Harvest Now, Decrypt Later Attack](#the-harvest-now-decrypt-later-attack)
- [Testing the Hybrid Handshake](#testing-the-hybrid-handshake)
- [Code Snippet: Benchmarking PQC Algorithms](#code-snippet-benchmarking-pqc-algorithms)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

RSA-2048 is secure today. In 2030, a quantum computer with four thousand stable qubits will crack it in seconds via
Shor's Algorithm. This is not science fiction. It is mathematics with a deadline.

The NIST has standardised new algorithms: **ML-KEM (Kyber)** and **ML-DSA (Dilithium)**. These names sound like rejected
Star Wars planets, but they are the future of cryptography.

**QA Challenge**: These keys are HUGE (kilobytes instead of bytes). Will your UDP packets fragment? Will your handshake
timeout? Will your IoT toaster run out of RAM trying to verify a signature? These are the questions that keep
cryptographers awake at night.

## TL;DR

- **Latency balloons with key size**: Post-Quantum keys are larger. Handshakes take longer. Test on 3G. If your app
  feels slow now, wait until you add ten kilobytes of cryptography to every request.
- **Fragmentation breaks everything**: If the ClientHello exceeds 1500 bytes (MTU), packet loss skyrockets.
- **Hybrid mode doubles the work**: You must run "Hybrid Mode" (RSA + Kyber) for the next decade. Double the keys,
  double the fun, double the latency.

## The Harvest Now, Decrypt Later Attack

Hackers are stealing your encrypted data *today*. They cannot read it yet. They store it on cheap hard drives and wait.

In 2030, they will decrypt it. Your customers' medical records, your company's intellectual property, every embarrassing
email chain—all readable.

**QA Strategy**: Verify that all "Long Term Secrets" (API keys, private health records, skeletons in the digital closet)
are re-encrypted with PQC (Post-Quantum Cryptography) *now*. Do not wait for the quantum computer to exist. By then, it
is too late.

## Testing the Hybrid Handshake

Browsers are rolling out `X25519Kyber768Draft00`. This combines ECC (Elliptic Curve Cryptography) with Kyber. If the
quantum part fails (because mathematics is hard), ECC saves you.

**QA Tooling**: You need a custom build of **OpenSSL 3.2+** or **BoringSSL** to test this. Standard `curl` will not
support it unless you compile it yourself. Welcome to C hell. Bring snacks.

## Code Snippet: Benchmarking PQC Algorithms

Comparing the size and speed of RSA versus Kyber. Small keys are so 2020.

```javascript
/*
  pqc-benchmark.js
*/
const { performance } = require('perf_hooks');

// Mock data based on NIST Round 3 results
// Size in Bytes
const ALGORITHMS = {
    'RSA-2048': { publicKey: 256, signature: 256, encryptTime: 0.02 },
    'Kyber-512': { publicKey: 800, signature: 0, encryptTime: 0.04 }, // KEM has no signature
    'Dilithium-2': { publicKey: 1312, signature: 2420, encryptTime: 0.06 }
};

function runBenchmark() {
    console.log('Algorithm      | Key Size (B) | Sig Size (B) | Latency (ms)');
    console.log('---------------|--------------|--------------|-------------');
    
    for (const [name, specs] of Object.entries(ALGORITHMS)) {
        console.log(
            `${name.padEnd(14)} | ` +
            `${specs.publicKey.toString().padEnd(12)} | ` +
            `${specs.signature.toString().padEnd(12)} | ` +
            `${specs.encryptTime}`
        );
    }
}

runBenchmark();

// Note: Dilithium signature is 2.4KB! 
// This will fragment a standard TCP packet (1.5KB).
// Expect retransmission storms on bad networks.
```

## Summary

The "Quantum Apocalypse" (Y2Q) is a deadline. We do not know when it is. Maybe 2028. Maybe 2035. But migration takes
years. Start testing now.

If you are the QA Lead who forgot to test PQC, you will be the reason the company gets hacked in 2032. And unlike
regular hacks, this one will be mathematically inevitable. No pressure.

## Key Takeaways

- **Certificates need upgrading**: Your TLS certificates use RSA signatures. You need to upgrade your CA (Certificate
  Authority) infrastructure. Good luck explaining that to Ops.
- **JWTs get heavy**: If you use JSON Web Tokens, adding a Dilithium signature adds 2KB to *every request header*. That
  is massive.
- **Hardware acceleration is missing**: Current CPUs have AES-NI instructions. They do not have Kyber instructions yet.
  Expect high CPU usage and hot servers.

## Next Steps

- **Tool**: **Open Quantum Safe** (liboqs).
- **Standard**: **NIST FIPS 203, 204, 205**. Read them.
- **Action**: Scan your repo for "RSA", "ECDSA", "Diffie-Hellman". Flag them as Technical Debt.
