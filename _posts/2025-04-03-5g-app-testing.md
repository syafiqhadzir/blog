---
layout: post
title: '5G App Testing: QA at the Speed of Light'
date: 2025-04-03
category: QA
slug: 5g-app-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Network Slicing" Confusion](#the-network-slicing-confusion)
- [Handover Hell (5G to 4G to 3G)](#handover-hell-5g-to-4g-to-3g)
- [Code Snippet: Detecting Connection Quality](#code-snippet-detecting-connection-quality)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

5G is here. It promises "Zero Latency" and "Infinite Bandwidth". Marketing teams love it. QA teams hate it.

Why? Because users expect your app to load instantly. And when they walk into a lift and 5G drops to "E" (Edge) or "No Service", your app crashes because you assumed "Always On".

Testing 5G is not about testing speed; it is about testing the *loss* of speed.

## TL;DR

- **Slicing creates confusion**: 5G allows "Slices" (Virtual Channels). Your app might be in the "Background Data" slice (Slow) whilst the user is watching Netflix in the "Streaming" slice (Fast).
- **MEC brings servers closer**: Multi-Access Edge Computing means the server is physically closer to the user (at the cell tower). Latency should be <10ms.
- **Battery drain is real**: 5G modems are power-hungry. If your app keeps the radio active ("Tail State"), testing will reveal huge battery drain.

## The "Network Slicing" Confusion

5G networks can create virtual networks for specific use cases (e.g., "Gaming" slice vs "IoT" slice).

If your app demands the "Gaming" slice but the user is on a cheap pre-paid plan, the request falls back to "Best Effort".

**QA must test Graceful Degradation**: If we cannot get low latency (<20ms), disable the "Pro Mode" features (e.g., 4K streaming or real-time sync) instead of showing a spinner forever.

## Handover Hell (5G to 4G to 3G)

The most dangerous moment for a mobile app is the "Handover". You are on a 5G tower. You drive behind a building. You switch to 4G LTE.

The IP address might change. The latency spikes from 5ms to 100ms. Does your WebSocket disconnect? Does your file upload restart from 0%?

You need to simulate this network chaos (use a Faraday bag or a lift).

## Code Snippet: Detecting Connection Quality

We can use the `Network Information API` (`navigator.connection`) to adjust logic based on the *real* network state. Do not trust the symbol on the status bar.

```javascript
/*
  network-adapter.js
*/
function adaptToNetwork() {
    // Note: Safari support is limited, so always check existence
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (!conn) {
        console.warn("Network Information API not supported.");
        return; // Fallback to standard behaviour
    }

    console.log(`📡 Type: ${conn.effectiveType} | RTT: ${conn.rtt}ms | Downlink: ${conn.downlink}Mbps`);

    // 5G Logic: The API usually reports '4g' even for 5G, so check RTT (Round Trip Time)
    const isHighSpeed = conn.effectiveType === '4g' && conn.rtt < 30 && conn.downlink > 10;
    const isDataSaver = conn.saveData; // User enabled "Data Saver" mode

    if (isDataSaver) {
         console.log("💰 Data Saver detected. Serving text only.");
         disableImages();
    } else if (isHighSpeed) {
        console.log("🚀 5G/Fibre detected. Loading 4K assets.");
        loadHighResTextures();
    } else {
        console.log("⚠️ Standard 4G/3G. Loading optimised assets.");
        loadStandardTextures();
    }
}

// Listen for dynamic changes (e.g., User enters a tunnel)
if (navigator.connection) {
    navigator.connection.addEventListener('change', adaptToNetwork);
}
```

## Summary

5G is a luxury. Do not assume everyone has it.

The best QA strategy is to **Build for 3G, and Optimise for 5G**. If it works on a train going through a tunnel, it will work in a 5G city centre. If it only works on 5G, your app is broken for 90% of the world.

## Key Takeaways

- **Throttling reveals truth**: Use Chrome DevTools to throttle network to "Fast 3G". If the App goes white, you failed.
- **Packets still get lost**: 5G has high bandwidth but can still have packet loss (UDP). Test accordingly.
- **Data costs money**: 5G data is expensive. Does your app accidentally download 1GB of updates in the background on Mobile Data?

## Next Steps

- **Tool**: Use **Shopify Toxiproxy** to simulate network jitter and packet loss locally.
- **Learn**: Read about **QUIC (HTTP/3)** protocol. It solves many TCP handover issues.
- **Experiment**: Go to a basement (or a lift) and try to use your app during the signal loss.
