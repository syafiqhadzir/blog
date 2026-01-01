---
layout: post
title: 'Service Mesh Policy Testing: The Traffic Cop Says NO'
date: 2024-11-07
category: QA
slug: service-mesh-policy-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Sidecars and Proxies](#sidecars-and-proxies)
- [Testing mTLS Strictness](#testing-mtls-strictness)
- [Code Snippet: Verifying Traffic Splits](#code-snippet-verifying-traffic-splits)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

In the old days, Service A called Service B directly. Now, Service A calls a local proxy (Sidecar), which calls Service B's proxy, which calls Service B.

This is a Service Mesh (Istio, Linkerd, Consul). It gives you magic powers: Retries, Timeouts, Canaries, and mTLS (Encryption). But who tests the magic? You do.

If the YAML config is wrong, the traffic stops, and nobody knows why because the application logs show nothing.

## TL;DR

- **mTLS ensures mutual authentication**: Mutual TLS. Both sides prove their identity. Ensure unsecured `curl` fails.
- **Retries need testing**: If Service B is flaky, does the Mesh retry automatically? Test it by injecting random failures.
- **Fault Injection tests resilience**: Use the Mesh to inject 500 errors or latency without changing a single line of application code.

## Sidecars and Proxies

The Sidecar (Envoy) is a tiny server running next to your app in the same Pod. It intercepts all network traffic.

If the Sidecar crashes, your app is deaf and mute.

**QA Strategy**: Manually kill the sidecar container (`kubectl exec ... kill 1`) whilst the app is running. Does the pod restart successfully? Does traffic fail fast or hang?

Note: Kubernetes 1.28+ has native Sidecar support, making restarts less painful.

## Testing mTLS Strictness

"Strict mTLS" means "No encrypted ID, No entry".

Devs often leave it in "Permissive" mode during migration (allowing both HTTP and HTTPS) and forget to flip the switch.

**Test**: Exec into a pod *outside* the mesh (or a "Legacy" namespace) and try to `curl` a service *inside* the mesh. Result: Should be `Connection Reset` or `403 Forbidden`. If you get a `200 OK`, your security is a lie.

## Code Snippet: Verifying Traffic Splits

Canary deployments split traffic: 90% Stable, 10% Canary. Verify this statistical distribution. You cannot rely on "clicking refresh" in the browser.

```bash
#!/bin/bash
# verify-canary.sh

# Target Service
URL="http://my-app.staging.svc.cluster.local"

# Counters
v1_count=0
v2_count=0
total=100

echo "🚀 Firing $total requests to $URL..."

for i in $(seq 1 $total)
do
  # Capture the 'x-version' header returned by the app
  # Warning: Your app must actually return this header for debugging!
  response=$(curl -s -I $URL | grep -i "x-version")
  
  if [[ $response == *"v1"* ]]; then
    ((v1_count++))
    echo -n "."
  else
    ((v2_count++))
    echo -n "!"
  fi
done

echo ""
echo "📊 Results:"
echo "V1 (Stable): $v1_count"
echo "V2 (Canary): $v2_count"

# Check if within rough margin of error (e.g., target 10%)
# Statistical laws mean it won't be exactly 10.
if [ $v2_count -gt 5 ] && [ $v2_count -lt 15 ]; then
    echo "✅ PASS: Traffic split looks correct (~10%)."
else
    echo "❌ FAIL: Traffic split deviating significantly."
    exit 1
fi
```

## Summary

A Service Mesh moves complexity from Code to Config (YAML). This means fewer bugs in code (`retry_count = 3`), but massive bugs in YAML (`virtualService: ...`).

"I indented the retry policy wrong and now we DDoS ourselves." Validate the YAML. Use `istioctl analyse`.

## Key Takeaways

- **Observability comes free**: The Mesh gives you generic metrics (Latency, Success Rate) for free. Use them. If the Mesh says error rate is 50% but App logs say 0%, the requests are dying at the proxy.
- **Timeout Propagation needs review**: If A calls B (timeout 5s) and B calls C (timeout 10s)... that is bad. The Mesh cannot fix bad logic, but it can enforce caps.
- **Circuit Breakers need testing**: Test that the Mesh actually "opens the circuit" (stops sending requests) when errors spike, preventing cascading failures.

## Next Steps

- **Tool**: Use **Kiali** to visualise your Istio mesh service graph in real-time. It is beautiful.
- **Learn**: Understand **Envoy Proxy**. It powers most meshes. If you know Envoy, you know the mesh.
- **Audit**: Are your sidecar resources (CPU/RAM) tuned? They can eat your cluster if unchecked (The "Sidecar Tax").
