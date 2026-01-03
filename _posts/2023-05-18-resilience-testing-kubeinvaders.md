---
layout: post
title: 'Resilience Testing with Kube-Invaders: Gamifying Your Own Destruction'
date: 2023-05-18
category: QA
slug: resilience-testing-kubeinvaders
gpgkey: EBE8 BD81 6838 1BAF
tags: ["reliability"]
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Why Gamify Destruction?](#why-gamify-destruction)
- [Under the Hood](#under-the-hood)
- [Code Snippet: Safe Config](#code-snippet-safe-config)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

"Chaos Engineering" sounds serious. It sounds like something men in lab coats do whilst frowning at monitors.

**Kube-Invaders** turns it into an arcade game. It is literally "Space Invaders" for your Kubernetes cluster. You fly a
little ship, shoot aliens, and every time you kill an alien, it deletes a random Pod in your cluster.

It is the most fun you will ever have whilst terrifying your DevOps lead.

## TL;DR

- **The Concept**: Delete pods by shooting 8-bit aliens.
- **The Goal**: Visualise how quickly your pods respond (respawn).
- **The Safety**: Whitelist namespaces so you do not delete the CEO's blog.
- **The Fun**: It lowers the barrier to entry for Chaos Engineering.

## Why Gamify Destruction?

Because resilience testing is boring. Nobody wants to run `kubectl delete pod` scripts all day. But everyone wants to
get the high score.

By playing Kube-Invaders against a staging namespace, you visually verify:

1. **Recovery**: Does the alien (Pod) respawn? If it stays dead, your ReplicaSet is broken.
2. **Latency**: Does the game stutter (system lag) when you kill a boss (Database)?
3. **Cascading Failure**: Does killing one alien cause all other aliens to turn red (Error state)?

## Under the Hood

Kube-Invaders is just an HTML5 canvas game sitting on top of the Kubernetes API. When you press "Spacebar", it sends a
delete API call.

It is safe(ish). You can configure it to only target specific namespaces (please, for the love of God, do not point this
at `kube-system`).

## Code Snippet: Safe Config

Installing Kube-Invaders is easy with Helm. Here is the configuration to safeguard it so you do not accidentally delete
Production.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: kubeinvaders-config
  namespace: chaos-testing
data:
  # The URL of your cluster
  kubernetes_url: "https://kubernetes.default.svc"
  
  # CRITICAL: Whitelist only the namespaces you hate
  target_namespace: "staging-checkout,staging-cart"
  
  # How aggressive is the Chaos?
  # 0.1 = infrequent attacks by the alien AI
  chaos_probability: "0.2"
  
  # Route status updates
  route_host: "kubeinvaders.internal.company.com"
```

Once running, you open your browser and start blasting. It is a great demo for "Show and Tell" sessions. "Look, I'm
destroying the billing service, and the site is still up!"

## Summary

Resilience is not a state you reach, but a muscle you train. Gamifying chaos makes the stressful reality of
infrastructure failure a predictable and manageable part of your QA workflow.

Plus, it gives you a valid excuse to play video games at work.

## Key Takeaways

- **Self-Healing needs proof**: K8s is designed to heal. Prove it.
- **Blast Radius needs limiting**: Always limit chaos tools to specific namespaces or labels.
- **Observability reveals gaps**: If you kill a pod and your alerts do not fire, your monitoring is broken.

## Next Steps

- **Install**: Run Kube-Invaders on Minikube.
- **Play**: Shoot some pods.
- **Fix**: Identify why your service took 30 seconds to restart (hint: Java startup time).
