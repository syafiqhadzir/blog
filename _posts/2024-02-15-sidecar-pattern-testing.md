---
layout: post
title: "Sidecar Pattern Testing: When Your Container Needs a Buddy"
date: 2024-02-15
category: QA
slug: sidecar-pattern-testing
gpgkey: "EBE8 BD81 6838 1BAF"
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Parasitic" Relationship](#the-parasitic-relationship)
- [Testing the Handshake (Don't Trust Envoy)](#testing-the-handshake-dont-trust-envoy)
- [Code Snippet: Verifying Sidecar Connectivity](#code-snippet-verifying-sidecar-connectivity)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

In Kubernetes, a "Sidecar" is a container that sits inside the same Pod as your application, sharing the same network namespace (localhost) but having a separate lifecycle.

Common uses: Logging Agents (Splunk), Service Meshes (Envoy), or Auth Proxies (OAuth2).

Testing them is tricky because from the outside, they look like one blob. But if the sidecar crashes, your app might keep running but stop authenticating users. That is BAD.

## TL;DR

- **Lifecycle Sync matters**: What happens if the app starts before the DB Proxy? (Hint: It crashes).
- **Localhost is the shared network**: They talk over `127.0.0.1`. Verify this internally.
- **Resource Contention starves apps**: The sidecar eats CPU too. Do not let it starve the app.

## The "Parasitic" Relationship

A sidecar is meant to be helpful, but it can be a parasite.

I once saw a logging sidecar consume 2GB of RAM because it could not connect to the Splunk server and kept buffering logs in memory. Result? The OOMKiller killed the *Application*, not the Sidecar.

QA must test the "Bad Neighbour" scenario. Throttle the network to the sidecar. Does it explode and take the main app with it?

## Testing the Handshake (Don't Trust Envoy)

Your application assumes the sidecar is always there. "I'll just send traffic to localhost:9000 and it will magically be encrypted!"

You need to verify the *failure mode*. If the sidecar is dead, does the app return a 500 or does it hang forever?

Use `kubectl exec` to kill the sidecar processes and watch the app logs.

## Code Snippet: Verifying Sidecar Connectivity

You cannot test localhost from outside the pod. You need to run the test *inside* the pod context (or simulate it). Here is a script to check if the sidecar is listening.

```bash
#!/bin/bash
# run inside the container to verify sidecar visibility

SIDECAR_PORT=15000 # Admin port for Envoy

echo "checking sidecar connectivity..."

if nc -z -v -w5 127.0.0.1 $SIDECAR_PORT; then
  echo "✅ Sidecar is UP and listening on localhost"
else
  echo "❌ Sidecar is DOWN. Application traffic will fail."
  exit 1
fi

# Check memory usage of the sidecar process
# Note: 'pgrep' might not be installed in minimal images, be careful.
PID=$(pgrep envoy)
if [ -z "$PID" ]; then
    echo "⚠️ Envoy process not found!"
else
    # ps options vary by distro (Alpine vs Debian)
    MEM=$(ps -p $PID -o %mem --no-headers || echo "Unknown")
    echo "Sidecar Memory Usage: $MEM%"
fi
```

## Summary

Sidecars are great for decoupling logic (like auth) from business code. But they add a hidden point of failure.

Treat the Sidecar + App as a single atomic unit of testing. If one fails, they both fail.

## Key Takeaways

- **Startup Order needs coordination**: Ensure the Main App waits for the Sidecar (use a startupProbe or initContainer).
- **Graceful Shutdown needs coordination**: Ensure the Sidecar does not die whilst the App is finishing a request (preStop hooks).
- **Observability needs separation**: Monitor the sidecar's resource usage separately. It often does not show up in the App's APM.

## Next Steps

- **Experiment**: Use `toxiproxy` as a sidecar to simulate bad network conditions for your app.
- **Audit**: Check your `terminationGracePeriodSeconds`. It needs to be long enough for *both* containers to shut down.
- **Learn**: Read up on the "Ambassador Pattern" (a fancy version of a sidecar).
