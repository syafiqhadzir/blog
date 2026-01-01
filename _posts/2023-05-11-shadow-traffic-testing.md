---
layout: post
title: 'Shadow Traffic Testing: Testing in Production Without Getting Fired'
date: 2023-05-11
category: QA
slug: shadow-traffic-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Ninja of Testing](#the-ninja-of-testing)
- [The Danger Zone (Side Effects)](#the-danger-zone-side-effects)
- [Code Snippet: Istio Mirroring](#code-snippet-istio-mirroring)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

What if I told you there is a way to test your new code with **100% real production traffic** without a single user knowing?

No, it is not magic; it is **Shadow Traffic** (or Traffic Mirroring). It is the ultimate flex: running your new version alongside the old one, letting it sweat under the load, but discarding its responses so nobody sees the bugs. It is like a rehearsal where the audience is already seated, but they are watching a hologram of the previous show.

## TL;DR

- **Zero Risk to users**: If the shadow version crashes, the user (served by the stable version) sees nothing.
- **Real Data reveals truth**: No more "mock data" that looks too perfect. This is the messy, ugly real world.
- **Benchmarking compares versions**: Verify that V2 is just as fast as V1 before switching.

## The Ninja of Testing

Shadowing (also known as Dark Launching) involves duplicating incoming requests at the Load Balancer level.

1. **Primary**: Goes to `Service V1`. This responds to the user.
2. **Shadow**: Goes to `Service V2`. This processes the request, hits the DB, does the maths... and then the response is sent to `/dev/null`.

We monitor `Service V2`. Did it crash? Did it throw a 500 error? Did it calculate the tax wrong?

If `V2` explodes, we fix it silently. If `V2` survives the Friday night rush, we promote it to `V1`.

## The Danger Zone (Side Effects)

The catch? **Side Effects**.

If `Service V1` charges a credit card, and `Service V2` also charges the credit card, you are going to double-charge your customer. That is a CV Generating Event.

Shadow versions must:

- Have **Mocked Externalities** (Do not call Stripe).
- Or operate in a **Read-Only** mode.
- Or write to a **Shadow Database**.

## Code Snippet: Istio Mirroring

If you are using a Service Mesh like Istio or Envoy, shadowing is a configuration change, not a code change.

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: my-service
spec:
  hosts:
  - my-service
  http:
  - route:
    - destination:
        host: my-service-v1
        subset: v1
      weight: 100
    mirror:
      host: my-service-v2
      subset: v2
    mirror_percent: 100
```

In this config:

- **Route**: 100% of traffic goes to `v1` (The User).
- **Mirror**: 100% of traffic is *also* fire-and-forget copied to `v2` (The Shadow).

## Summary

Watch the mirror, protect the reality. Shadow traffic testing is the secret weapon of high-scale engineering teams (Google, Netflix), providing the confidence to refactor critical legacy systems without the "Big Bang" deployment fear.

## Key Takeaways

- **Idempotency prevents disasters**: Ensure your shadow service does not mutate data (or your users will hate you).
- **Diffing reveals regressions**: Use tools to compare `Response V1` vs `Response V2`. Differences indicate regressions.
- **Resource Usage doubles**: Remember, you are doubling the load on your database. Make sure it can handle 2x requests.

## Next Steps

- **Try It**: Use `GoReplay` or `Nginx` mirroring to validate this concept on a non-critical service.
- **Monitor**: Build a dashboard that compares V1 vs V2 latency side-by-side.
- **Mock**: Ensure your shadow service mocks out email sending.
