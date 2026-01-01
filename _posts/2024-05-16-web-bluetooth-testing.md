---
layout: post
title: 'Web Bluetooth Testing: Or How I Learned to Stop Worrying and Love the Dongle'
date: 2024-05-16
category: QA
slug: web-bluetooth-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Pairing" Friction](#the-pairing-friction)
- [The "Range" Anxiety](#the-range-anxiety)
  - [QA Scenario: "The Walkaway"](#qa-scenario-the-walkaway)
- [Code Snippet: Mocking Bluetooth in Tests](#code-snippet-mocking-bluetooth-in-tests)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

The web can now talk to your heart rate monitor, your drone, and your smart lightbulb. The `navigator.bluetooth` API is amazing.

It is also a security nightmare wrapped in a UX disaster. QA's job is to ensure that when the user clicks "Connect", their toaster does not explode.

## TL;DR

- **HTTPS is Required**: Bluetooth sends sensitive data. Localhost or HTTPS only. No exceptions.
- **User Gesture is Required**: You cannot scan for devices in the background. The user *must* click a button.
- **Flakiness is Expected**: Radio waves are unreliable. Test what happens when the connection drops mid-transfer.

## The "Pairing" Friction

The browser handles the pairing dialog. You cannot style it. You cannot control it.

**QA Test**:

1. Click "Connect".
2. Wait for the browser dialog.
3. Select device.
4. If it fails, does the app say "Try Again" or does it crash with `Uncaught TypeError`?

Most apps crash. Do not be most apps.

## The "Range" Anxiety

Bluetooth Low Energy (BLE) has a range of about 10 metres (if you are lucky).

### QA Scenario: "The Walkaway"

1. Connect to the device.
2. Walk 15 metres away (or put the phone in a microwave - do not turn it on).
3. Walk back.
4. Does it auto-reconnect? (Hint: No, unless you wrote code for it).

## Code Snippet: Mocking Bluetooth in Tests

You cannot automate real Bluetooth hardware easily (unless you build a robot finger to tap the screen). But you *can* mock the API in your test environment to verify your application logic.

```javascript
/*
  bluetooth-mock.js
  Inject this before your app loads to test BLE logic without hardware.
*/

class MockBluetoothDevice {
  constructor() {
    this.name = 'Mock Heart Rate Monitor';
    this.gatt = {
      connect: async () => {
        console.log('Connected to mock device');
        return {
          getPrimaryService: async (uuid) => {
            return {
              getCharacteristic: async (uuid) => {
                return {
                  startNotifications: async () => {},
                  addEventListener: (event, callback) => {
                     // Simulate heart rate data stream
                     setInterval(() => {
                       const value = new DataView(new ArrayBuffer(1));
                       value.setUint8(0, 72); // 72 BPM
                       callback({ target: { value } });
                     }, 1000);
                  }
                };
              }
            };
          }
        };
      }
    };
  }
}

// Monkey Patch the Navigator API
if (window.navigator) {
    window.navigator.bluetooth = {
      requestDevice: async () => new MockBluetoothDevice()
    };
}
```

## Summary

Web Bluetooth bridges the gap between the "Cloud" and the "Real World". But the real world is messy. Batteries die. Signals fade.

Your code must be robust enough to handle the physical reality of the user.

## Key Takeaways

- **Battery Level needs display**: Always read the standard `battery_level` service (0x180F). Show it in the UI.
- **Firmware Updates are the boss fight**: Can your web app update the device firmware (DFU)? That is the ultimate QA boss fight.
- **Privacy requires care**: Do not bond to devices you do not own.

## Next Steps

- **Tool**: Use **nRF Connect** (Android/iOS) to debug BLE services and characteristics. It is the bible of BLE.
- **Learn**: Understand **GATT** (Generic Attribute Profile) services and characteristics. UUIDs are ugly but necessary.
- **Audit**: Check if your app disconnects cleanly (`device.gatt.disconnect()`) when the tab is closed.
