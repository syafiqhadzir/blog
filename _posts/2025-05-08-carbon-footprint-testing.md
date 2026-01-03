---
layout: post
title: 'Carbon Footprint Testing: How Dirty is Your Backend?'
date: 2025-05-08
category: QA
slug: carbon-footprint-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:
- strategies
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Server Location Matters (Grid Intensity)](#server-location-matters-grid-intensity)
- [The "Zombie VM" Epidemic](#the-zombie-vm-epidemic)
- [Code Snippet: Calculating API Emissions](#code-snippet-calculating-api-emissions)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Your code runs on electricity. That electricity comes from burning dinosaur bones (mostly) or splitting atoms.

Therefore, your unoptimised `SELECT * FROM big_table` query is literally melting the ice caps. QA has a new metric:
"Grams of CO2 per Request".

It sounds hipster, but in 2025, "Green Software" is a Board Level KPI (ESG Scores). Optimising code saves the planet
*and* the cloud bill.

## TL;DR

- **Region matters enormously**: Hosting in "us-east-1" (Virginia - Coal/Gas) vs "eu-north-1" (Stockholm - Hydro/Wind)
  makes a 10x carbon difference.
- **Timing affects emissions**: Run heavy batch jobs (Train AI, Backups) at night when the grid is cleaner (and cooler,
  requiring less AC).
- **Bloat wastes energy**: Delete the 500TB of log files from 2019 that nobody reads. Storing junk burns energy.

## Server Location Matters (Grid Intensity)

Not all electrons are created equal.

Sweden (Hydro/Nuclear) < France (Nuclear) < Germany (Coal/Renewables) < India (Coal).

**QA Check**: "Is our Production Environment located in a Green Region?" If you are serving French users from a server
in Virginia, you are failing both **Latency** (Physics) and **Sustainability** (Ethics). Move the data to the user.

## The "Zombie VM" Epidemic

A "Zombie" is a server that is running, costing money, emitting CO2, but doing zero work. Usually, it is a "Temporary
Dev Environment" from last year's hackathon that Dave forgot to turn off. It has been idling at 2% CPU for 365 days.

**QA Audit**: "If a server consumes < 5% CPU for 30 days, kill it." Better yet, use **Spot Instances** or **Serverless**
so it turns off automatically.

## Code Snippet: Calculating API Emissions

We can estimate the carbon cost of an API call based on its duration and the server's location carbon intensity using
the **SCI (Software Carbon Intensity)** equation.

```python
"""
carbon.py - A rough estimator
"""
def calculate_co2(duration_sec, core_count, region="us-east-1"):
    # Power Usage Effectiveness (PUE) of the datacenter (AWS/Azure avg ~1.2)
    # 1.0 means perfectly efficient. 2.0 means half the energy goes to AC.
    pue = 1.15
    
    # Average CPU power consumption (Watts)
    # A modern server core might consume ~5W at load
    power_watts = core_count * 5.0
    
    # Energy (kWh) = Power (kW) * Time (hours)
    energy_kwh = (power_watts / 1000) * (duration_sec / 3600) * pue
    
    # Carbon Intensity (gCO2/kWh) - Data from ElectricityMaps.com
    grid_intensity = {
        "us-east-1": 380,  # Virginia (Mixed)
        "eu-north-1": 15,  # Stockholm (Clean)
        "ap-south-1": 650, # Mumbai (Dirty)
        "eu-west-3": 50    # Paris (Nuclear - Low Carbon)
    }
    
    intensity = grid_intensity.get(region, 475)  # Global avg fallback
    
    emissions_grams = energy_kwh * intensity
    return emissions_grams

# Example: A 10-second query on a 16-core DB server in Virginia
co2 = calculate_co2(10, 16, "us-east-1")
print(f"💨 Emission: {co2:.4f} grams of CO2")

# Example: Same query in Sweden
co2_clean = calculate_co2(10, 16, "eu-north-1")
print(f"🌲 Emission (Sweden): {co2_clean:.4f} grams of CO2")
print(f"📉 Reduction: {((co2 - co2_clean) / co2) * 100:.1f}%")
```

## Summary

We used to optimise for "Space" (Memory). Then we optimised for "Time" (Speed). Now we optimise for "Carbon" (Survival).

The irony is that Carbon optimisation usually leads to faster, cheaper code. It is a win-win. Code efficiency is the
only "Free Lunch" in sustainability.

## Key Takeaways

- **Lazy Loading saves watts**: Do not load the map library if the user does not open the "Contact Us" modal.
- **Compression reduces transmission**: **Brotli** > Gzip. **AVIF** > JPEG. Smaller files = Less energy to transmit over
  5G towers.
- **Caching is green**: The greenest request is the one that never hits the server. Use CDNs aggressively.

## Next Steps

- **Tool**: Use **Cloud Carbon Footprint** (open source tool) to provide a dashboard of your AWS bill's environmental
  impact.
- **Learn**: Read **"Building Green Software"** by O'Reilly. It is the new standard.
- **Audit**: Identify your "Top 5" most expensive SQL queries. Optimising them saves money and the planet.
