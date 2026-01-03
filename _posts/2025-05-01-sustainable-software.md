---
layout: post
title: 'Sustainable Software: Is Your Code Killing the Polar Bears?'
date: 2025-05-01
category: QA
slug: sustainable-software
gpgkey: EBE8 BD81 6838 1BAF
tags: ['artificial-intelligence', 'automation']
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Software Carbon Intensity (SCI)](#software-carbon-intensity-sci)
- [The "Dark Mode" Fallacy](#the-dark-mode-fallacy)
- [Code Snippet: Measuring Page Weight Impact](#code-snippet-measuring-page-weight-impact)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

The Internet emits more carbon than the airline industry (approximately 3.7% of
global emissions).

Every time you load a 5MB hero image, a lump of coal is thrown into a furnace
somewhere to power the servers and the routers. It is a grim mental image, but
it is accurate.

QA usually focuses on "Functionality" and "Performance". It is time to focus on
"Efficiency". Because if your app drains the user's battery, they will uninstall
it faster than you can say "Net Zero".

## TL;DR

- **Assets need compression**: No one needs a 4K PNG of a button. Use WebP/AVIF.
- **Polling is eco-terrorism**: Every 1 second? Really? Use WebSockets or
  Server-Sent Events.
- **Algorithm efficiency matters**: If your algorithm is Big-O `O(N²)`, you are
  heating the planet unnecessarily. Fix the logic.

## Software Carbon Intensity (SCI)

The Green Software Foundation defines SCI as:
`SCI = ((Energy × Carbon Intensity) + Embodied Emissions) / Functional Unit`

In English: "How much CO2 per User Journey?"

**QA Task**: Measure the CPU time of the "Checkout" flow. If Release A takes
500ms CPU and Release B takes 1500ms CPU, you have tripled the carbon footprint
(and cost). Fail the build.

## The "Dark Mode" Fallacy

"Dark Mode saves battery!" Only on OLED screens (pixels turn off). On LCDs, the
backlight is on anyway.

Real energy saving comes from:

1. **Blocking Ad trackers**: They consume up to 40% of mobile data and CPU.
2. **Deferring non-critical JS**: Do not load the Chatbot until the user clicks
   it.
3. **Aggressive Caching**: The greenest request is the one you never make.

## Code Snippet: Measuring Page Weight Impact

Here is a script to estimate the CO2 of your page load (using the Sustainable
Web Design model). Put this in your CI pipeline.

```javascript
/*
  carbon-audit.js
*/
function estimateCarbon(transferSizeMB) {
  // The model assumes ~0.81 kWh/GB for data transfer across the network
  // Source: Sustainable Web Design
  const kwhPerGB = 0.81;
  const carbonPerKWh = 442; // Global average gCO2/kWh (Grid intensity)

  // 1GB = 1024MB
  const energy = (transferSizeMB / 1024) * kwhPerGB;
  const co2 = energy * carbonPerKWh;

  return co2.toFixed(3);
}

// Get transfer size from Performance API
const entries = performance.getEntriesByType('navigation')[0];
// Fallback for Safari
const transferSize = entries?.transferSize || entries?.encodedBodySize || 0;
const transferMB = transferSize / (1024 * 1024);

console.log(`🌍 Data Transferred: ${transferMB.toFixed(2)} MB`);
console.log(`💨 Carbon Footprint: ${estimateCarbon(transferMB)} gCO2`);

// Sustainability Budget: 1.5MB max per page
if (transferMB > 1.5) {
  console.warn(
    '⚠️  Page is too heavy! Compress your assets or sustain the Shame.',
  );
}
```

## Summary

Performance optimisation IS sustainability optimisation. If you make it faster,
you make it greener. You kill two birds with one stone (but please do not kill
actual birds; climate change is doing enough of that).

Green QA is simply Efficient QA with a moral compass.

## Key Takeaways

- **Green Hosting matters**: Check if your cloud provider uses renewable energy
  (`thegreenwebfoundation.org`). Google Cloud and Azure are carbon neutral(ish).
  AWS is getting there.
- **Zombie Servers waste energy**: Shut down your staging environments at night.
  You are paying for them to do nothing but emit heat. Use "Scale to Zero".
- **Autoplay video is the enemy**: Disable it by default (`autoplay="false"`).
  It saves gigabytes.

## Next Steps

- **Tool**: Use **Website Carbon Calculator** to audit your public pages.
- **Learn**: Read the **Green Software Foundation** principles. It changes how
  you think about code.
- **Audit**: Check your `robots.txt`. Stop AI crawlers from scraping your site
  1000 times a day. That is wasted compute.
