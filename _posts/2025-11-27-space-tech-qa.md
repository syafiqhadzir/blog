---
layout: post
title: 'Space Tech for QA: Coding in a Vacuum (Literally)'
date: 2025-11-27
category: QA
slug: space-tech-qa
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
---## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Radiation and Bit Flips](#radiation-and-bit-flips)
- [The Speed of Light Limitation](#the-speed-of-light-limitation)
- [Code Snippet: Hamming Code Simulation](#code-snippet-hamming-code-simulation)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

In web development, if a server crashes, we restart it. In space tech, if a satellite crashes, it is a hundred-million-pound brick floating in orbit. You cannot SSH into a CubeSat. There is no "Have you tried turning it off and on again?" when the device is hurtling past the Moon.

**QA Challenge**: Simulating an environment where upgrades are impossible and rebooting takes two hours (orbital time). If you think "connectivity issues" on the tube are bad, try Mars.

## TL;DR

- **Memory scrubbing is essential**: Cosmic rays will flip a 0 to a 1. Your code must detect this and recover gracefully.
- **Bandwidth is precious**: You have 9600 baud. Not gigabits. Logging must be binary and compressed. JSON is forbidden—it is simply too chatty.
- **Thermal extremes dominate**: In sunlight, the CPU burns. In shadow, it freezes. Test your app at -40°C logic limitations.

## Radiation and Bit Flips

A "Single Event Upset" (SEU) occurs when a high-energy particle strikes a RAM transistor. `let isAdmin = false;` (0) becomes `let isAdmin = true;` (1). The universe has just promoted an attacker to admin status without any code execution.

**QA Strategy**: Use **Fault Injection**. Randomly corrupt variables in memory during the test suite execution. Does the system detect the anomaly and reset? Or does it execute the admin command? If it executes, you just nuked the payload. Literally.

## The Speed of Light Limitation

Mars is three to twenty-two light-minutes away, depending on orbital positions. A request/response round trip takes up to forty-four minutes. You cannot use "REST APIs" or "chatty protocols". TCP handshakes are a comedy routine nobody has time for.

You use **Delay Tolerant Networking (DTN)** and the **Bundle Protocol**.

**Test Case**: Send a request. Disconnect the network for forty minutes. Reconnect. Does the response arrive? If your app throws a timeout exception after thirty seconds, congratulations—you have just failed the Mars test.

## Code Snippet: Hamming Code Simulation

Simulating Error Correction Code (ECC) in software to recover from bit flips.

```javascript
/*
  ecc-simulation.js
*/

// Simple Parity Check simulation (Single Bit Error Detection)
// Real ECC uses Reed-Solomon or Hamming(7,4)

function generatePacket(data) {
    const payload = data.toString(2).padStart(8, '0');
    // Calculate Parity Bit (Even)
    const parity = (payload.split('1').length - 1) % 2 === 0 ? 0 : 1;
    return { payload, parity };
}

function receivePacket(packet) {
    const currentParity = (packet.payload.split('1').length - 1) % 2 === 0 ? 0 : 1;
    
    if (currentParity !== packet.parity) {
        throw new Error('CORRUPTION DETECTED: SEU occurred. Dropping packet.');
    }
    return parseInt(packet.payload, 2);
}

// Test Run
try {
    const cleanPacket = generatePacket(42);
    console.log('Sending:', cleanPacket);
    
    // Simulate Radiation Hit (Flip the first bit)
    const corruptedPayload = '1' + cleanPacket.payload.substring(1); 
    const radioactivePacket = { ...cleanPacket, payload: corruptedPayload };
    
    console.log('Received (Corrupted):', radioactivePacket);
    receivePacket(radioactivePacket);
} catch (e) {
    console.log(`✅ System Saved: ${e.message}`);
}
```

## Summary

Space QA is the ultimate discipline. It teaches you minimal computing. It forces you to handle "Hardware Failure" as a normal state, not an exception.

Everything breaks. The radiation always wins eventually. Your job is to make sure the data survives long enough to be useful. Think of it as defensive driving, but the other drivers are cosmic rays travelling at near-light speed.

## Key Takeaways

- **Watchdogs are mandatory**: Every thread must have a hardware watchdog timer. If the code hangs, the hardware reboots it. There are no manual restarts in low Earth orbit.
- **Asymmetric links require asymmetric testing**: Uplink is slow (commands). Downlink is fast (images). Test this asymmetry explicitly.
- **Orbital mechanics dictate availability**: A Low Earth Orbit (LEO) satellite is only visible for ten minutes per pass. Your upload must resume after a ninety-minute gap.

## Next Steps

- **Tool**: **NASA cFS (Core Flight System)** — Open Source Flight Software framework.
- **Learn**: **CCSDS** standards. Unfairly effective and underappreciated.
- **Hardware**: Buy a Raspberry Pi Zero and run it on a solar panel. That is your dev kit.
