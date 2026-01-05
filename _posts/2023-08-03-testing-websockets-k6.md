---
layout: post
title: 'WebSocket Testing with K6: Marriage Counselling for your Server'
date: 2023-08-03
category: QA
slug: testing-websockets-k6
gpgkey: EBE8 BD81 6838 1BAF
tags: ['real-time', 'websockets', 'backend-testing']
description:
  'REST APIs are easy. You ask for data, the server gives data, and you both
  walk away. No strings attached. It is a casual transaction.'
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Stateful Nightmare](#the-stateful-nightmare)
- [Why K6?](#why-k6)
- [Code Snippet: Flooding the Chat](#code-snippet-flooding-the-chat)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

REST APIs are easy. You ask for data, the server gives data, and you both walk
away. No strings attached. It is a casual transaction.

WebSockets are a marriage. You perform a handshake, you move in together, and
you talk constantly. And just like marriage, maintaining thousands of persistent
connections is _exhausting_.

Most load tools (like JMeter) struggle with WebSockets because threads are
heavy. Enter **K6**, a tool written in Go that eats concurrency for breakfast.

## TL;DR

- **Persistent State is hard**: Testing 1,000 requests is easy. Testing 1,000
  held open connections is hard.
- **Handshake Storms kill servers**: The server usually dies when everyone tries
  to connect at once (e.g., app launch).
- **Latency needs measurement**: You must measure how long it takes for a
  message to travel from Client A -> Server -> Client B.

## The Stateful Nightmare

In HTTP land, if you have 10,000 users, you might only have 100 active requests
at any specific millisecond.

In WebSocket land, 10,000 users means 10,000 open TCP connections. This
consumes:

1. **File Descriptors**: Creating a "Too many open files" error on Linux
   properly configured servers.
2. **RAM**: Each connection has overhead (buffers, keep-alive state).
3. **Heartbeats**: The server must ping them all to keep them alive.

## Why K6?

K6 scripts are written in JavaScript (easy for front-end devs) but run on a Go
engine (fast). The `k6/ws` module allows you to implement listeners, event
loops, and timers easily without the thread-blocking issues of Node.js-based
runners or the memory bloat of Java-based runners.

## Code Snippet: Flooding the Chat

Here is a K6 script that connects to a chat server, subscribes to a channel,
sends a message, and expects an echo.

```javascript
// load-test.js
import ws from 'k6/ws';
import { check } from 'k6';

export default function () {
  const url = 'ws://localhost:3000/room/general';

  // Custom headers or auth tokens
  const params = { tags: { my_tag: 'load_test_bot' } };

  const res = ws.connect(url, params, function (socket) {
    socket.on('open', function open() {
      console.log('Connected');

      // Send a message every 1 second
      socket.setInterval(function timeout() {
        socket.send(JSON.stringify({ event: 'chat', msg: 'Hello World' }));
      }, 1000);
    });

    socket.on('message', function (data) {
      // Validate we got the echo back
      const msg = JSON.parse(data);
      check(msg, { 'received chat': (m) => m.event === 'chat' });
    });

    socket.on('close', () => console.log('disconnected'));

    // Hold the connection open for 10 seconds (Simulate user session)
    socket.setTimeout(function () {
      socket.close();
    }, 10000);
  });

  check(res, { 'status is 101': (r) => r && r.status === 101 });
}
```

Running this with `k6 run --vus 100 --duration 30s load-test.js` will create 100
concurrent chatters screaming into the void.

## Summary

WebSockets require a different testing philosophy. You are not testing
"Throughput" (Requests per Second); you are testing "Capacity" (Concurrent
Connections).

K6 is the perfect tool to simulate the "Thundering Herd" scenario where your
entire userbase reconnects simultaneously after a server restart.

## Key Takeaways

- **Status 101 is correct**: The HTTP status code for "Switching Protocols". If
  you see 200, you failed.
- **Tuning Linux is required**: You likely need to increase `ulimit -n` on your
  load generator, or you will run out of file handles before the server does.
- **Failover needs testing**: What happens to those 10,000 active users if you
  redeploy? Do they reconnect gracefully or DDOS your login server?

## Next Steps

- **Install**: `brew install k6` or download the binary.
- **Monitor**: Connect a Grafana dashboard to K6 to visualise the latency
  spikes.
- **Crash It**: Find the exact number of connections that makes your server run
  out of RAM.
