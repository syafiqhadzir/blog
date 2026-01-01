---
layout: post
title: 'Log Aggregation for Debugging: No More SSH'
date: 2023-09-28
category: QA
slug: log-aggregation-debugging
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
---## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Grep Struggle](#the-grep-struggle)
- [Centralised vs Distributed](#centralised-vs-distributed)
- [Code Snippet: Fluentd Config](#code-snippet-fluentd-config)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

In the old days, if a server crashed, you would SSH into it, `cd /var/log`, and run `tail -f server.log`.

Then we invented Microservices. Now you have 50 servers. SSH-ing into all of them is effectively a DDoS attack on your own productivity.

**Log Aggregation** is the practice of sucking all those logs into one big search engine (like ELK, Splunk, or Datadog) so you can debug the entire system from your browser whilst sipping coffee.

## TL;DR

- **Centralise logs immediately**: Logs must leave the container immediately (`stdout`).
- **Structure beats plaintext**: JSON > Plain Text.
- **Sanitise for compliance**: Never log passwords, API keys, or PII (GDPR is watching).

## The Grep Struggle

Searching a 2GB text file with `grep` characterises a "Junior Developer". Searching 500GB of indexed logs with Kibana characterises a "Senior Engineer".

**QA Challenge**: Verify that when an error occurs, it actually appears in the aggregator.

I have seen systems where the app was crashing, but the logging agent (Fluentd) was also crashing, so the dashboard showed "100% Health" whilst the users were burning the comments section.

## Centralised vs Distributed

- **Distributed**: Logs stay on the server. If the server dies (Auto-Scaling Group triggers), the logs die with it. Forensics is impossible.
- **Centralised**: Logs are shipped to a separate cluster. If the app server dies, the evidence remains.

For QA, this means you can perform **Post-Mortems** on transient failures. "Why did the payment fail at 2 AM?" -> Search logs -> "Oh, the generic-3rd-party-api timed out."

## Code Snippet: Fluentd Config

Here is how you configure `fluentd` to tail a Docker log file and verify it catches the output.

```xml
<!-- fluent.conf -->
<source>
  @type tail
  path /var/lib/docker/containers/*/*-json.log
  pos_file /var/log/fluentd-docker.pos
  tag docker.*
  <parse>
    @type json
  </parse>
</source>

<!-- Enrich the logs with metadata (Where did this come from?) -->
<filter docker.**>
  @type record_transformer
  <record>
    hostname "#{Socket.gethostname}"
    environment "staging"
  </record>
</filter>

<!-- Ship it to ElasticSearch -->
<match docker.**>
  @type elasticsearch
  host elasticsearch
  port 9200
  logstash_format true
</match>
```

**QA Test**: Deploy a "Log Generator" pod that prints 100 lines/second. Check Kibana receives 100 lines/second. If it receives 80, your logging pipeline has drop issues (backpressure), and you will lose critical errors during a spike.

## Summary

Logs are the "Black Box" of your application aircraft. Any application running without log aggregation is flying blind.

And remember: Friends do not let friends parse raw text logs with Regex.

## Key Takeaways

- **No Files**: Applications should log to `stdout`/`stderr`. Let the infrastructure (Docker/K8s) handle the files.
- **Retention needs limits**: Logs occupy space (and cost money). Delete debug logs after 7 days; keep error logs for 90 days.
- **Redaction needs testing**: Write a test that deliberately logs a fake credit card number, then verify it is masked (`****`) in the dashboard.

## Next Steps

- **Alerting**: Turn your log search into an alert. "If 'Exception' appears > 10 times in 1 min, Slack me."
- **Dashboard**: Create a "Top 10 Errors" dashboard for the morning stand-up.
- **Cost**: Realise Splunk is expensive and convince your boss to optimise logging levels (Info vs Debug).
