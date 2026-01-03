---
layout: post
title: 'WebSocket Scale Testing: Melting the Server'
date: 2024-10-17
category: QA
slug: websocket-scale-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:
- quality-assurance
- real-time
- testing
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The C10k Problem (Refresher)](#the-c10k-problem-refresher)
- [Ephemeral Ports Exhaustion](#ephemeral-ports-exhaustion)
- [Code Snippet: k6 WebSocket Testing](#code-snippet-k6-websocket-testing)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

"It works on my machine!"

Yes, Dave, because you are the only user. WebSockets are persistent. They hold the door open. 10,000 users = 10,000 open
doors.

Testing one connection is easy. Testing 100k connections requires an army of bots (and a big QA budget). Most devs
forget that a WebSocket connection is a stateful marriage, not a casual HTTP fling.

## TL;DR

- **Load Generators need distribution**: You cannot act as 10k users from one laptop. You need a cluster of load
  generators.
- **Protocol differs from HTTP**: WebSockets (WS) !== HTTP. You cannot just `curl` it.
- **Failover causes thundering herds**: What happens when the WebSocket server crashes? Do all 10k clients reconnect
  instantly? (This is called the "Thundering Herd" and it will DDoS you).

## The C10k Problem (Refresher)

In 1999, handling 10,000 concurrent clients was hard. In 2024, it is still annoying if you use the wrong architecture.

**WebSockets consume**:

1. **File Descriptors** (Linux treats sockets as files).
2. **RAM** (Each connection has overhead, typically 2KB to 50KB depending on the language).
3. **Heartbeats** (Ping/Pong frame processing).

If you use Node.js, one CPU core handles everything. If you block the Event Loop, all 10k users disconnect.

## Ephemeral Ports Exhaustion

Your Operating System has ~65k ports (TCP limits). If you open 10k connections, you are fine. If you (the tester) try to
open 60k connections from one machine, you run out of ports (`EADDRNOTAVAIL`).

**QA Strategy**: Use multiple IP addresses on your load generator (Virtual Interfaces) to bypass the limit, or
distribute tests across multiple EC2 instances.

## Code Snippet: k6 WebSocket Testing

`k6` is brilliant for this. It is written in Go (fast) and scripted in JS (easy).

```javascript
/*
  load-test.js
  Run with: k6 run load-test.js
*/
import ws from 'k6/ws';
import { check } from 'k6';

export const options = {
  vus: 1000, // 1,000 Virtual Users
  duration: '30s',
};

export default function () {
  const url = 'wss://echo.websocket.org';
  const params = { tags: { my_tag: 'test_run' } };

  // Connect
  const res = ws.connect(url, params, function (socket) {
    socket.on('open', function open() {
      console.log('connected');
      
      // Mimic Heartbeat: Send Ping every second
      socket.setInterval(function timeout() {
        socket.send(JSON.stringify({ type: 'PING', data: Date.now() }));
      }, 1000);
    });

    socket.on('message', function (message) {
      if (!message) return;
      // Verification: Did we get a response?
      check(message, { 'Received echo': (msg) => msg.length > 0 });
    });

    socket.on('close', () => console.log('disconnected'));
    
    // Random disconnect to simulate chaos
    socket.setTimeout(() => socket.close(), 25000);
  });

  // Verification: Handshake status 101 Switching Protocols
  check(res, { 'status is 101': (r) => r && r.status === 101 });
}
```

## Summary

Testing WebSockets at scale is expensive. It melts servers. It trips firewalls (state tables).

But it is the only way to know if your "Real-Time Chat" will survive Black Friday. If you do not load test it, your
users will load test it for you (and they will break it).

## Key Takeaways

- **Reconnect Jitter prevents self-DDoS**: If the server restarts, ensure all clients do not reconnect at the *exact
  same millisecond*. Add random delays (e.g., `delay = random(0, 5000ms)`).
- **Load Balancers need sticky sessions**: Sticky Sessions (`ip_hash`) are mandatory for WS scaling if you store state
  locally. Ensure your AWS ALB handles this correctly.
- **Compression has trade-offs**: `permessage-deflate`. It saves bandwidth but burns CPU. Test the trade-off.

## Next Steps

- **Tool**: Use **k6** or **Artillery.io** for serious WS load testing.
- **Learn**: Read about **Socket.IO scalability** (Redis Adapters vs NATS).
- **Audit**: Check your Linux `ulimit -n`. It defaults to 1024. Bump it to 1,000,000.
