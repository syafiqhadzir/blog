---
layout: post
title: 'Homomorphic Encryption: Computing in a Black Box'
date: 2025-06-12
category: QA
slug: homomorphic-encryption
gpgkey: EBE8 BD81 6838 1BAF
tags:
- encryption
- strategies
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Magic of H(a) + H(b) = H(a+b)](#the-magic-of-ha--hb--hab)
- [The Noise Barrier](#the-noise-barrier)
- [Code Snippet: Simulated Homomorphic Addition](#code-snippet-simulated-homomorphic-addition)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Imagine you have a locked box containing a number. You cannot open it. You send the box to a mathematician. The
mathematician adds "5" to the box without opening it. They send the box back. You open it with your key. The number
inside has increased by 5.

This is **Homomorphic Encryption (HE)**.

It allows cloud servers to process sensitive data (Medical Records, Bank Balances) *without ever decrypting it*. The
server never sees your data, but it can still do the mathematics. It sounds impossible, but it is just very clever
algebra.

## TL;DR

- **PHE vs FHE**: **Partially** HE (Addition OR Multiplication) is fast. **Fully** HE (Addition AND Multiplication) is
  historically very slow.
- **Ciphertext Expansion bloats data**: An encrypted "1" might be 4MB in size. Bandwidth is a testing bottleneck.
- **Correctness is mathematical**: `Decrypt(Op(Encrypt(A))) == Op(A)`. If this fails, mathematics is broken.

## The Magic of H(a) + H(b) = H(a+b)

In standard encryption (AES), if you change one bit of the encrypted text, the decrypted result is garbage.

In HE, the mathematics is preserved "homomorphically" (same shape).

**QA Challenge**: Mathematics on floating point numbers in HE is hard. Usually, you work with integers or fixed-point
representations. Rounding errors can explode deeper inside a circuit.

## The Noise Barrier

Every operation in HE adds "Noise" to the ciphertext. If you do too many multiplications, the noise overwhelms the
signal, and you effectively decrypt rubbish.

**Bootstrapping** is a technique to "refresh" the ciphertext and reduce noise, but it is computationally expensive. Like
taking your car for a service after every journey.

**QA Test**: Stress test the "Circuit Depth". Can we do 10 operations? 100? 1000? At what point does `Decrypt()` fail?

## Code Snippet: Simulated Homomorphic Addition

Since actual FHE libraries (like Microsoft SEAL or TFHE) are complex C++ bindings, here is a conceptual test using
Paillier (Additive HE) logic.

```javascript
/*
  he-math.spec.js
*/

// Mocking a Paillier cryptosystem for demonstration
// Property: Enc(m1) * Enc(m2) = Enc(m1 + m2)
class PaillierMock {
    constructor(p, q) {
        this.n = p * q;
        this.n2 = this.n * this.n;
        this.g = this.n + 1; // Simplified g
    }

    encrypt(m) {
        // c = g^m * r^n mod n^2 (Simplified)
        // For testing, just wrapping the value 
        // In real HE, this returns a massive BigInt buffer
        return { value: m, type: 'ciphertext' };
    }

    // Homomorphic Addition: Multiply the ciphertexts
    add(c1, c2) {
        // Concept: Decrypt(C1 * C2) = M1 + M2
        // In this mock, we simulate the "blind" addition
        return { value: c1.value + c2.value, type: 'ciphertext' };
    }

    decrypt(c) {
        return c.value;
    }
}

test('should perform blind addition on encrypted data', () => {
    const he = new PaillierMock(17, 19);
    
    // 1. Client encrypts data
    const salaryA = 50000;
    const salaryB = 60000;
    
    const encA = he.encrypt(salaryA);
    const encB = he.encrypt(salaryB);
    
    // 2. Server "Adds" them (Blindly)
    // The server CANNOT see 50000 or 60000.
    const encSum = he.add(encA, encB);
    
    // 3. Client decrypts result
    const decryptedSum = he.decrypt(encSum);
    
    expect(decryptedSum).toBe(110000);
});

test('server should not know values', () => {
    const he = new PaillierMock(17, 19);
    const encA = he.encrypt(500);
    
    // The server object purely sees the ciphertext wrapper
    expect(encA.type).toBe('ciphertext');
});
```

## Summary

Homomorphic Encryption is the "Holy Grail" of privacy.

It is computationally heavy (100x-1000x slower than plaintext), but for specific high-security tasks (Voting, DNA
analysis), it is revolutionary. QA requires moving from "functional testing" to "mathematical verification".

## Key Takeaways

- **Performance resembles vintage computing**: It acts like a 1980s CPU. Optimise your "circuits". Do not encrypt what
  you do not have to.
- **Data types have limits**: You do not have infinite precision. Watch out for overflows.
- **Security requires key isolation**: Ensure the server *actually* has no key. If the keys are in memory on the compute
  node, it is not HE.

## Next Steps

- **Tool**: Try **Microsoft SEAL** (Simple Encrypted Arithmetic Library).
- **Library**: **Concrete** (Zama) allows compiling Rust/Python directly to FHE circuits.
- **Concept**: Learn about **MPC** (Multi-Party Computation) as an alternative to FHE.
