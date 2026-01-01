---
layout: post
title: "Service Virtualisation: The Fake It Till You Make It Strategy"
date: 2023-04-20
category: QA
slug: service-virtualization
gpgkey: "EBE8 BD81 6838 1BAF"
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Mocking vs Virtualisation](#mocking-vs-virtualisation)
- [The "Digital Twin" Concept](#the-digital-twin-concept)
- [Code Snippet: Using Hoverfly](#code-snippet-using-hoverfly)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Imagine you are building a house, but the windows will not arrive for six months. Do you stop building? No, you put up plastic sheets and keep working.

**Service Virtualisation (SV)** is that plastic sheet, but high-tech. It is the practice of simulating the behaviour of expensive, unavailable, or just plain cranky dependencies (like mainframes or 3rd party payment gateways) so your dev team does not have to sit on their hands playing table tennis.

## TL;DR

- **Save Money**: Do not pay Visa £0.10 every time you test a transaction.
- **Save Time**: Do not wait for the Backend team to finish their API.
- **Simulator benefits**: It helps you simulate network lag and 500 errors that the real service rarely throws.

## Mocking vs Virtualisation

"But wait," I hear you cry, "is not this just mocking?"

Well, yes and no.

- **Mocks** are like cardboard cutouts. They are static, dumb, and live inside your unit test code.
- **Virtual Services** are like an animatronic dinosaur. They run on a real network port, maintain state ("I remember you deposited £50, so now your balance is £150"), and can simplify complex protocol handshakes.

If mocking is a bicycle, Service Virtualisation is a Ducati.

## The "Digital Twin" Concept

SV creates a "Digital Twin" of the dependency. You record the traffic between your app and the real service once, and then replay it forever. This is essential for:

1. **Mainframes**: Access is often limited to a 2-hour window on Tuesdays (if the wind is blowing North).
2. **Third Parties**: Salesforce or PayPal sandboxes often have rate limits that your performance checks will smash in seconds.

## Code Snippet: Using Hoverfly

Hoverfly is a fantastic open-source SV tool. Here is how you can simulate a slow payment provider using a JSON simulation file.

```json
{
  "data": {
    "pairs": [
      {
        "request": {
          "method": [ { "matcher": "exact", "value": "POST" } ],
          "path": [ { "matcher": "exact", "value": "/api/v1/charge" } ]
        },
        "response": {
          "status": 200,
          "body": "{\"status\": \"success\", \"transaction_id\": \"12345\"}",
          "headers": {
            "Content-Type": ["application/json"]
          },
          "delays": [
            {
              "delay": 2000,
              "logNormalDelay": null 
            }
          ]
        }
      }
    ]
  }
}
```

By adding that `delays` block, every request to this virtual endpoint will wait exactly 2 seconds before responding. Now you can test if your application's "Loading Spinner" actually works, without needing to physically strangle the network cable.

## Summary

Service Virtualisation removes the roadblocks of reality. It empowers QA to test early, often, and rigorously, regardless of whether the entire ecosystem is online.

It turns "We are blocked by the API team" into "We finished testing three days ago."

## Key Takeaways

- **Shift Left**: Start testing before the real API even exists.
- **Performance testing becomes possible**: Virtual services can respond faster (or slower) than the real thing, allowing for stress testing.
- **Cost savings are real**: A virtual transaction costs £0.00. A real Stripe transaction costs actual revenue.

## Next Steps

- **Tooling**: Download **Hoverfly** or **WireMock**.
- **Record**: Run your app against the real service for one hour to capture traffic (Record Mode).
- **Replay**: Switch the config to playback mode and disconnect the internet. Watch the magic happen.
