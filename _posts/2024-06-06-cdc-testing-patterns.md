---
layout: post
title: 'CDC Testing Patterns: Spying on Your Database'
date: 2024-06-06
category: QA
slug: cdc-testing-patterns
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Eventual" in Eventual Consistency](#the-eventual-in-eventual-consistency)
- [Schema Evolution: The Checkmate](#schema-evolution-the-checkmate)
- [Code Snippet: Verifying CDC Events with SQL](#code-snippet-verifying-cdc-events-with-sql)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Change Data Capture (CDC) tools like Debezium or AWS DMS read your database logs (WAL or binlog) and emit events. "User Created" -> Kafka -> Elasticsearch.

It sounds magical. Until someone renames a column and the entire pipeline explodes.

QA's job is to ensure the "Capture" actually captures the "Change" before your analytics dashboard reports that you have zero customers.

## TL;DR

- **Latency needs SLAs**: How long does it take for `INSERT INTO users` to show up in the Data Warehouse? (SLA: < 2s).
- **Transformations need verification**: If the DB stores `price` as `1000` (cents), does the CDC event output `10.00` (pounds)?
- **Deletes need tombstones**: Hard deletes vs Soft deletes. Does the CDC tool emit a tombstone record to clear the downstream cache?

## The "Eventual" in Eventual Consistency

"Eventual" might mean 5 milliseconds. It might mean 5 days. Devs assume it is instant.

**QA Test**:

1. Write to Primary DB.
2. Read from Read Replica immediately.
3. Fail? (Yes, you will likely get a 404).

You *must* test with retries/polling logic. The replication lag is a feature, not a bug, but your tests need to be aware of it.

## Schema Evolution: The Checkmate

DBA adds a column: `preferred_colour`.
CDC Connector: "I don't know this column. I will ignore it."
Downstream Service: "Where is the colour? I am crashing now."

**QA Strategy**: Automated `ALTER TABLE` tests in CI to verify the CDC connector config updates automatically. If you use Avro, verify that the Schema Registry handles the new version correctly (Forward vs Backward Compatibility).

## Code Snippet: Verifying CDC Events with SQL

You can treat the CDC topic as just another database table if you use a tool like ksqlDB or just good old-fashioned polling in your test suite.

```javascript
/*
  cdc.test.js
  Verifying that DB updates propagate to the search index.
*/
const { db, elasticsearch, poll } = require('./test-utils');

async function verifyCDC(userId) {
  console.log(`Updating User ${userId} to active...`);
  
  // 1. Trigger the source of truth change
  await db.query("UPDATE users SET status = 'active' WHERE id = ?", [userId]);

  // 2. Poll the downstream system (e.g., Elasticsearch, Kafka Consumer)
  // We cannot expect it to be instant.
  await poll(async () => {
    const doc = await elasticsearch.get(userId);
    
    // Check if the record exists AND if it has the new value
    if (!doc || doc.status !== 'active') {
      throw new Error('CDC event not propagated yet');
    }
    return doc;
  }, { 
      timeout: 5000, // Give up after 5 seconds
      interval: 100  // Check every 100ms
  });
  
  console.log("CDC Propagation successful.");
}
```

## Summary

CDC is the nervous system of modern architecture. If it fails, your services are lobotomised.

Do not trust the configuration YAML. Test the actual bits flowing through the wire. And please, monitor the replication lag metric.

## Key Takeaways

- **Snapshotting takes time**: When you first start CDC, it dumps the whole DB. This takes hours. Test the "Initial Snapshot" phase separately from "Streaming".
- **Filtering protects PII**: Ensure PII (passwords, SSNs) are blacklisted in the CDC config. Do not stream passwords to Kafka.
- **Heartbeat keeps connections alive**: If no data changes, does the connector die? No, it should emit heartbeat messages to keep the connection alive.

## Next Steps

- **Tool**: Use **Testcontainers** to spin up Kafka + Zookeeper + Postgres + Debezium in Docker for integration tests.
- **Learn**: Read about **Kafka Connect** converters (Avro vs JSON Schema).
- **Audit**: Check if your "Deleted" rows are actually being removed from the search index (Tombstone handling).
