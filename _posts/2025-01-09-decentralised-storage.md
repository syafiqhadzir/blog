---
layout: post
title: 'Decentralised Storage: The Link That Never Rots'
date: 2025-01-09
category: QA
slug: decentralised-storage
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [IPFS and Content Addressing](#ipfs-and-content-addressing)
- [The Pinning Problem (The "Use It or Lose It" trap)](#the-pinning-problem-the-use-it-or-lose-it-trap)
- [Code Snippet: Verifying CIDs](#code-snippet-verifying-cids)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

In Web2, a link points to a Location (URL). `google.com/cat.jpg`. If Google moves the file or goes bankrupt, 404 Error. The link rots.

In Web3 (IPFS), a link points to the *Content itself* (CID). It is like asking the internet: "Who has the file with hash `QmXyZ...`?" If *anyone* has it, you get it.

It transforms QA from "Is the server up?" to "Is the swarm alive?".

## TL;DR

- **CID (Content Identifier)**: A cryptographic hash of the file. If one pixel changes, the hash changes (and you get a new CID).
- **Availability is not guaranteed**: Just because you uploaded it does not mean anyone else stores it. If you turn off your laptop, the file might disappear from the network.
- **Gateways are the weak link**: Most users access IPFS via HTTP Gateways (e.g., `ipfs.io/ipfs/CID`). Test these gateways; they are the weak link.

## IPFS and Content Addressing

You do not upload "cat.jpg". You upload the *bytes* of cat.jpg. You get back `QmHash123...`.

**QA Strategy**: Verify integrity. Download the file from the network, hash it locally, and compare it to the CID. They MUST match. If they do not, the network is lying (unlikely) or your library is broken (likely).

Also, test **Deduplication**. Upload the same file twice. You should get the same CID.

## The Pinning Problem (The "Use It or Lose It" trap)

IPFS nodes throw away garbage (Garbage Collection) to save disk space. Your file is garbage unless you "Pin" it.

If you stop paying your Pinning Service (Pinata, Infura, NFT.Storage), your NFT image vanishes.

**QA Test the "Unpin" scenario**:

1. Upload file.
2. Pin it.
3. Fetch it (Success).
4. Unpin it.
5. Run Garbage Collection on the node.
6. Fetch it. (Should Fail/Timeout).

Does the app handle missing assets gracefully? Or does it show a broken image icon?

## Code Snippet: Verifying CIDs

Do not trust the gateway. Verify the bytes.

```javascript
/*
  ipfs-integrity.spec.js
*/
const fs = require('fs');
const Hash = require('ipfs-only-hash');
const { test, expect } = require('@playwright/test');

test('should verify file integrity before upload', async () => {
  const filePath = './assets/logo.png';
  const fileBuffer = fs.readFileSync(filePath);

  // 1. Calculate expected CID locally (without uploading)
  const expectedCID = await Hash.of(fileBuffer);
  console.log(`Expected CID: ${expectedCID}`);

  // 2. Simulate Upload (Mocked for brevity)
  const uploadedCID = await uploadToIPFS(fileBuffer); // user-defined function

  expect(uploadedCID).toBe(expectedCID);
});

test('should fetch from gateway with fallback', async ({ page }) => {
  const cid = 'QmTest123...';
  // Use a public gateway
  const gatewayUrl = `https://ipfs.io/ipfs/${cid}`;
  
  const response = await page.request.get(gatewayUrl);
  
  if (!response.ok()) {
    console.warn("Public gateway failed, trying backup...");
    // Fallback to Pinata
    const backupResponse = await page.request.get(`https://gateway.pinata.cloud/ipfs/${cid}`);
    expect(backupResponse.ok()).toBeTruthy();
  } else {
    expect(response.ok()).toBeTruthy();
  }
});
```

## Summary

Decentralised storage is magic when it works, and a black hole when it does not.

Be the QA who asks: "What if the only node seeding this file goes offline?" (Answer: The file is gone forever). Always have a redundancy plan (e.g., Filecoin or Arweave).

## Key Takeaways

- **Arweave offers permanence**: "Permissionless Permanent Storage". You pay once, store forever. Test that the transaction actually finalised (can take 20 mins).
- **Mime Types must be handled**: IPFS is just bytes. It does not know it is a PDF. Your app must sniff the content type or store it in the metadata.
- **Latency is significant**: DHT (Distributed Hash Table) lookups are slow. Fetching content can take 30+ seconds. Show a spinner.

## Next Steps

- **Tool**: Use **IPFS Desktop** to run a local node and inspect traffic. It helps you understand the "Swarm".
- **Learn**: Read about **Filecoin**. Ideally, people get paid to store your stuff, ensuring persistence.
- **Audit**: Check your NFTs. Are the metadata JSONs stored on IPFS, or on a central server (AWS)? (If AWS, it is not a real NFT; it is a receipt).
