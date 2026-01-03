---
layout: post
title: 'Web3 Smart Contract: Code is Law (and Lawsuits)'
date: 2025-01-02
category: QA
slug: web3-smart-contract
gpgkey: EBE8 BD81 6838 1BAF
tags: ["blockchain", "contract-testing", "web3", "automation", "frontend-testing"]
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Immutable" Bug](#the-immutable-bug)
- [Gas Optimisation vs. Readability](#gas-optimisation-vs-readability)
- [Code Snippet: Reverting Transactions](#code-snippet-reverting-transactions)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

In Web2, if you ship a bug, you deploy a hotfix 5 minutes later. No big deal.

In Web3, if you ship a bug, hackers steal $50 million in 12 seconds, and you cannot stop them because the blockchain is
"immutable".

Smart Contract QA is the highest stakes game in software engineering. You are not testing features; you are testing a
digital bank vault that lives in a public square filled with pickpockets.

## TL;DR

- **Reentrancy is the classic hack**: The DAO, 2016. Can I call `withdraw()` recursively before my balance is updated?
- **Gas affects usability**: Does this function cost £0.50 or £500 to run? Users hate expensive gas. If it costs more
  than the value transferred, the contract is bricked.
- **Oracles introduce external risk**: If you rely on an external price feed (e.g., Chainlink) for ETH/USD, what happens
  if it freezes or reports £0?

## The "Immutable" Bug

Once a contract is deployed to Mainnet, it stays there forever. You can use "Proxy Patterns" (Upgradeability) to swap
the logic contract, but that introduces centralisation risk (admin keys).

**QA Strategy**: Testnet (Sepolia/Goerli) is not enough. You need **Mainnet Forking**. Simulate your contract
interacting with the *real* Uniswap state locally. If your test mocks Uniswap, your test is lying. Real DeFi is messy.

## Gas Optimisation vs. Readability

Solidity developers often write weird code to save Gas (execution fees). They use `assembly {}` blocks, bitwise shifts,
and unchecked maths.

This makes code hard to read and easy to break. QA must verify that the "optimisation" did not break the business logic.
"We saved 500 gas units, but now the interest calculation is off by 0.0001%."

## Code Snippet: Reverting Transactions

In Solidity, you want tests to confirm that bad actions *fail* correctly. A passing test confirms the "Happy Path". A
reverting test confirms the "Security Path".

```javascript
/*
  Bank.test.js using Hardhat/Ethers
*/
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Bank Contract", function () {
  it("Should revert if withdrawal exceeds balance", async function () {
    const Bank = await ethers.getContractFactory("Bank");
    const bank = await Bank.deploy();
    await bank.deployed();
    
    // Deposit 1 ETH
    await bank.deposit({ value: ethers.utils.parseEther("1.0") });

    // Try to withdraw 10 ETH
    // We expect the transaction to fail with a specific error message
    await expect(
      bank.withdraw(ethers.utils.parseEther("10.0"))
    ).to.be.revertedWith("Insufficient funds");
  });

  it("Should prevent non-owners from pausing the bank", async function () {
    const [owner, hacker] = await ethers.getSigners();
    const Bank = await ethers.getContractFactory("Bank");
    const bank = await Bank.deploy();

    // Connect as hacker and try to call onlyOwner function
    await expect(
      bank.connect(hacker).pause()
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
```

## Summary

Web3 QA is 10% UI testing (dApps) and 90% Maths/Security audit.

If you do not understand the EVM (Ethereum Virtual Machine), storage slots, and `msg.sender`, you are just clicking
buttons. And clicking buttons will not save the DAO.

## Key Takeaways

- **Fuzzing finds edge cases**: Randomly hammer the inputs with billions of values. Tools like **Foundry** are built for
  this. Example: `testDeposit(uint256 amount)`.
- **Access Control must be verified**: Can a totally random wallet call `initialise()`? (The Wallet Parity Hack).
- **Front-running steals profit**: If I see your transaction in the Mempool (waiting area), can I pay more gas to jump
  ahead of you and steal your profit? (MEV).

## Next Steps

- **Tool**: Use **Hardhat** (JS) or **Foundry** (Rust/Solidity) for local development. Foundry is faster.
- **Learn**: Play **The Ethernaut** CTF (Capture The Flag). It teaches you how to hack contracts so you can defend them.
- **Audit**: Get a third-party audit (OpenZeppelin, Trail of Bits). It costs a fortune, but so does getting hacked.
