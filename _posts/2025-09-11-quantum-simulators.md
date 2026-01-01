---
layout: post
title: 'Quantum Simulators: When ''Maybe'' is the Correct Answer'
date: 2025-09-11
category: QA
slug: quantum-simulators
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Probabilistic Problem](#the-probabilistic-problem)
- [Simulating Entanglement](#simulating-entanglement)
- [Code Snippet: Measuring Quantum State Distribution](#code-snippet-measuring-quantum-state-distribution)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Classical computers deal with Bits (0 or 1). It is simple. It is binary. It is safe.

Quantum computers deal with Qubits (0, 1, or *both*). It is magic. Until we have stable quantum hardware on every desk (next Tuesday, perhaps?), we use **Simulators**. These differ from standard emulators because they model **physics**, not logic gates.

**QA Challenge**: If you run a test and it fails 50% of the time, that might be *exactly what it is supposed to do*. Welcome to Probabilistic Testing. Leave your booleans at the door.

## TL;DR

- **Superposition requires mathematical verification**: A qubit exists in a complex vector space. Standard assertions do not apply.
- **Statistical significance replaces exact matching**: You do not assert `result == 1`. You assert `result == 1 with p > 0.95`.
- **Noise modelling is mandatory**: Real quantum computers are noisy. Your simulator must model "decoherence", or you are testing a fantasy.

## The Probabilistic Problem

In normal QA: `assert(add(2, 2) == 4)`. If it returns 3.99, you file a bug.

In Quantum QA: `assert(measure(qubit) has 50% chance of being 1)`.

You cannot run a test once. You must run it a thousand times (called **Shots**) and check the **Distribution**. If you get 480 ones and 520 zeros, the test passes. If you get 100 ones and 900 zeros, the physics engine is broken, or someone observed the cat.

## Simulating Entanglement

Entanglement means if you measure Qubit A, Qubit B changes instantly. Even if separated by light years. Spooky action at a distance, as Einstein called it.

This breaks "Unit Testing" isolation principles. You cannot mock Qubit B. The system is holistic.

**QA Strategy**: Testing requires "State Vector" inspection. In simulation, we *can* peek at the private state without collapsing the wavefunction. Cheat. Cheat as much as you can. It is the only way.

## Code Snippet: Measuring Quantum State Distribution

Using a mock quantum circuit runner to verify probability distributions. We are testing randomness here.

```javascript
/*
  quantum-circuit.spec.js
*/

// Mock Simulator Output (1000 shots of a Hadamard Gate)
// H|0> = 50% |0> + 50% |1>
function runQuantumCircuit(shots) {
    const results = { '0': 0, '1': 0 };
    for (let i = 0; i < shots; i++) {
        // Simulate true randomness (or as close as Math.random() gets)
        const outcome = Math.random() > 0.5 ? '1' : '0';
        results[outcome]++;
    }
    return results;
}

test('Hadamard gate should create equal superposition', () => {
    const SHOTS = 1000;
    const results = runQuantumCircuit(SHOTS);
    
    const p0 = results['0'] / SHOTS;
    const p1 = results['1'] / SHOTS;
    
    console.log(`P(0): ${p0}, P(1): ${p1}`);
    
    // We expect 0.5, but randomness is... random.
    // Allow for statistical variance (Standard Deviation)
    // 50% +/- 5%
    expect(p0).toBeGreaterThan(0.45);
    expect(p0).toBeLessThan(0.55);
    
    expect(p1).toBeGreaterThan(0.45);
    expect(p1).toBeLessThan(0.55);
});
```

## Summary

Quantum software is coming. It will break RSA encryption (Shor's Algorithm) and revolutionise chemistry simulations.

QA engineers need to learn Linear Algebra. The logic is no longer `Boolean`. It is `Complex` (literally, complex numbers). If you thought JavaScript type coercion was confusing, wait until you meet imaginary numbers.

## Key Takeaways

- **Reversibility is testable**: Quantum gates are reversible (Unitary). `U * U_dagger = Identity`. Test this property. If you cannot reverse the computation, you broke physics.
- **Resources are precious**: Qubits are expensive. Optimising circuit depth is a quality attribute.
- **Debugging is constrained**: You cannot `console.log` a qubit in production (it collapses). You need specialised quantum debuggers.

## Next Steps

- **Tool**: **IBM Qiskit** (Python) or **Microsoft Q#**.
- **Learn**: Understand **Bra-ket notation** ($| \psi \rangle$). It looks scary but it is just shorthand for vectors.
- **Experiment**: Run a "Hello World" (Bell State) on a real IBM Quantum computer via the cloud. It is free and makes you feel smart.
