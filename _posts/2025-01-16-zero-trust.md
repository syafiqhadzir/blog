---
layout: post
title: 'Zero Trust: My Thermostat is Hacking Me'
date: 2025-01-16
category: QA
slug: zero-trust
gpgkey: EBE8 BD81 6838 1BAF
tags: ['zero-trust', 'security']
description:
  'Old School Security: "We have a castle wall (Firewall). Inside the wall,
  everyone is trusted. Even the printer."'
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Death of the VPN](#the-death-of-the-vpn)
- [Device Health Checks (The "Sick Laptop" Test)](#device-health-checks-the-sick-laptop-test)
- [Code Snippet: Access Policy Testing](#code-snippet-access-policy-testing)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Old School Security: "We have a castle wall (Firewall). Inside the wall,
everyone is trusted. Even the printer."

New School (Zero Trust): "There is no wall. Everyone is a potential attacker.
Especially the printer."

QA for Zero Trust means you stop assuming the network is safe. You assume the
network is hostile. You assume the admin's laptop is compromised.

## TL;DR

- **Identity needs context**: User + Password is not enough. We need Context
  (Location, Device, Time). If I login from North Korea 5 minutes after logging
  in from London, block me.
- **Least Privilege is essential**: Why does the Marketing Intern have admin
  access to the Production Database? (Answer: "It was easier to just give `*`
  permissions"). Fix it.
- **Micro-segmentation limits blast radius**: If Server A (Web) is compromised,
  it should not be able to talk to Server B (Payroll) unless explicitly allowed.

## The Death of the VPN

VPNs put you "on the network". Zero Trust puts you "on the app".

If you access Jira, you get a tunnel to Jira _only_. You cannot scan the rest of
the network.

**QA Strategy**: Connect from a "dirty" network (e.g., tether to your phone or
use a public WiFi simulator). Does the app force MFA? Does it block access
because your OS version is outdated?

## Device Health Checks (The "Sick Laptop" Test)

Zero Trust proxies (like Cloudflare Access, Zscaler, or Google IAP) check your
laptop posture. "Is Antivirus on?" "Is Disk Encrypted?" "Is OS Patched?"

**QA Test the "Sick Device" scenario**:

1. Take a test VM.
2. Disable the firewall.
3. Uninstall the Antivirus.
4. Try to access the Admin Panel. Result: **Access Denied**. The policy should
   catch you.

## Code Snippet: Access Policy Testing

Simulate requests from different contexts to verify policy enforcement. Note:
You cannot easily spoof IP addresses in TCP, but you can spoof `X-Forwarded-For`
to test application logic (though real Zero Trust handles this at the network
layer).

```javascript
/*
  zero-trust.spec.js
*/
const { test, expect } = require('@playwright/test');

test('should enforce policy based on location', async ({ request }) => {
  // 1. Valid Request (Simulated IP from Allowed Country)
  const allowedResp = await request.get('https://internal-tool.com', {
    headers: { 'CF-IPCountry': 'US' }, // Cloudflare adds this header
  });
  // Note: True Zero Trust relies on the Proxy adding this header, not the user.
  // In a test environment, you might mock the Proxy.

  // 2. Invalid Request (Blocked Country)
  const blockedResp = await request.get('https://internal-tool.com', {
    headers: { 'CF-IPCountry': 'XX' },
  });

  expect(blockedResp.status()).toBe(403);
});

test('should require mTLS certificate', async ({ request }) => {
  // Attempt to connect without client certificate
  try {
    await request.get('https://mtls-protected.internal');
  } catch (e) {
    expect(e.message).toContain('socket hang up'); // or handshake failure
  }
});
```

## Summary

Zero Trust is paranoid. But in a world of Ransomware, paranoia is a survival
skill.

QA is the Chief Paranoia Officer. "I do not trust you, Dave. Show me your
certificate." "I still do not trust you, Dave. Input your YubiKey."

## Key Takeaways

- **Continuous Auth protects sessions**: Just because you logged in at 9 AM does
  not mean you are safe at 10 AM. Re- verify periodically (Short session
  timeouts).
- **Lateral Movement must be blocked**: If a hacker compromises the "About Us"
  page container, can they `ssh` to the SQL database? Test it. (Run `nmap` from
  inside a pod).
- **Logs are essential**: Zero Trust generates massive logs. Ensure they are
  being ingested (SIEM). If a tree falls in a Zero Trust forest and nobody logs
  it, you get hacked.

## Next Steps

- **Tool**: Play with **Cloudflare Zero Trust** (free tier). Set up a policy for
  your personal blog admin page.
- **Learn**: Read the **BeyondCorp** papers from Google. It is the blueprint for
  modern security.
- **Audit**: Do you have hardcoded API keys in your internal scripts? "But it's
  internal!" - That violates Zero Trust. Rotate them.
