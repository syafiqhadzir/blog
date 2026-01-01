---
layout: post
title: 'IoT Device Testing: When the Backend is a Lightbulb'
date: 2024-05-23
category: QA
slug: iot-device-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Digital Twin" Illusion](#the-digital-twin-illusion)
- [Firmware Updates: Russian Roulette](#firmware-updates-russian-roulette)
- [Code Snippet: Simulating IoT Telemetry with MQTT](#code-snippet-simulating-iot-telemetry-with-mqtt)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Internet of Things (IoT). It means your fridge has a Twitter account and your doorbell has an IP address.

Testing IoT is unique because "Connectivity" is not just about HTTP 200 OK. It is about "Did the garage door actually open, or did the app just say it opened and invite burglars in?"

## TL;DR

- **Protocol differs from HTTP**: It is rarely HTTP. It is usually MQTT, CoAP, or some proprietary socket nightmare.
- **Latency is expected**: The device is on a slow, battery-powered radio. Expect 5-second delays.
- **State drifts**: The "Cloud State" (Digital Twin) and "Device State" (Physical) will drift. Your job is to catch it.

## The "Digital Twin" Illusion

The app shows the light is "ON". But the light is "OFF" because the WiFi packet got lost.

**QA Strategy**:

1. Force a "State mismatch" (unplug the device from power).
2. Tweak the app UI (Toggle switch to ON).
3. Observe if the app detects the device is unreachable ("Shadow Update Rejected").

If the app cheerfully says "Light turned ON" whilst the device is dead, you have failed. The UI must reflect *reality*, not *intent*.

## Firmware Updates: Russian Roulette

Over-The-Air (OTA) updates are the most dangerous operation in IoT. If it fails, you do not just have a bug. You have a "Brick" (a very expensive paperweight).

### QA Scenario: "The Power Cut"

1. Start an OTA update.
2. Unplug the power at 50%.
3. Plug it back in.
4. Does it recover (A/B partition swap) or is it dead forever?

## Code Snippet: Simulating IoT Telemetry with MQTT

You cannot have 1,000 physical thermostats on your desk. But you can spawn 1,000 Python scripts that *pretend* to be thermostats.

```python
import paho.mqtt.client as mqtt
import time
import json
import random

# The IoT Broker (Replace with your actual broker)
BROKER = "mqtt.example.com"
TOPIC = "devices/thermostat/123/telemetry"

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT Broker!")
    else:
        print(f"Failed to connect, return code {rc}")

client = mqtt.Client()
client.on_connect = on_connect

# Connect to broker
try:
    client.connect(BROKER, 1883, 60)
    client.loop_start()

    while True:
        # Simulate temperature fluctuation
        payload = {
            "temp": round(random.uniform(20.0, 25.0), 2),
            "battery": 85,
            "timestamp": int(time.time())
        }
        
        print(f"Publishing: {payload}")
        client.publish(TOPIC, json.dumps(payload))
        time.sleep(5) # Send every 5 seconds
except Exception as e:
    print(f"Error: {e}")
```

## Summary

IoT testing connects the digital world to the physical world. The stakes are higher. A bug in a web app is annoying. A bug in a smart lock leaves someone stranded in the rain.

Be paranoid. Test the hardware.

## Key Takeaways

- **Keep-Alive prevents silent disconnection**: MQTT connections drop silently. Ensure you have a "Last Will and Testament" (LWT) message configured on the broker.
- **Security requires changing defaults**: If your device uses default credentials (`admin:admin`), you are part of a botnet.
- **Geofencing needs GPS simulation**: Does the heater turn on when I am 5 miles away? Simulating GPS locations is mandatory.

## Next Steps

- **Tool**: Use **HiveMQ** public broker for testing MQTT logic if you do not have a dev environment yet.
- **Learn**: Read the **AWS IoT Core** documentation (even if you do not use it, the concepts like Device Shadows are universal).
- **Audit**: Check if your device leaks its WiFi credentials to the serial console log (`UART`).
