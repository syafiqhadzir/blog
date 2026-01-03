---
layout: post
title: 'Database Migration Testing: Don''t Drop the Table'
date: 2023-06-22
category: QA
slug: database-migration-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:
- quality-assurance
- testing
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Expand and Contract Pattern](#the-expand-and-contract-pattern)
- [Testing the Rollback](#testing-the-rollback)
- [Code Snippet: Safe Column Rename](#code-snippet-safe-column-rename)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Deploying application code is easy. If it breaks, you just revert the specific docker container.

Deploying database changes is **terrifying**. If you accidentally run `DROP TABLE users;`, there is no "Ctrl+Z". You are
restoring from a backup whilst the CEO breathes down your neck and the stock price plummets.

Testing migrations is the only way to lower your heart rate during deployments. It ensures that your SQL scripts modify
the data correctly without locking the database for 4 hours.

## TL;DR

- **Zero Downtime is the goal**: Use the "Expand and Contract" pattern to avoid breaking active users.
- **Sanitised Data is safer**: Test against a copy of Production data, not empty tables.
- **Rollback needs testing**: Always write and test the `down` script. If you cannot undo it, do not do it.

## The Expand and Contract Pattern

The big mistake junior devs make is renaming a column in a single step.

1. **Code V1** expects `user_name` (old column).
2. **Migration** renames `user_name` to `username`.
3. **Code V2** expects `username` (new column).

During the deployment (which takes time), **Code V1** is still processing requests but the database now has `username`.
**Code V1** crashes.

The solution is **Expand and Contract**:

1. **Expand**: Add `username` column. Copy data from `user_name` to `username`. (Both columns exist).
2. **Contract**: Deploy Code V2 (which writes to both, reads from `username`).
3. **Cleanup**: Once V1 is gone, drop the `user_name` column.

## Testing the Rollback

Every migration tool (Flyway, Alembic, Knex) allows you to define a `down` method. Most developers leave it empty or
write `// TODO`.

This is suicidal. If your deployment fails halfway through, you need to be able to undo the database changes instantly.
A tested rollback script is your parachute. If you do not pack it, do not jump out of the aeroplane.

## Code Snippet: Safe Column Rename

Here is how you safely rename a column without downtime using raw SQL (conceptually).

```sql
-- Step 1: Add the new column (nullable initially)
ALTER TABLE users ADD COLUMN username VARCHAR(255);

-- Step 2: Backfill data (in small batches if 1M+ rows)
-- Do NOT run a single massive UPDATE, or you will lock the table.
UPDATE users SET username = user_name WHERE username IS NULL LIMIT 1000;

-- Step 3: Add constraints (after backfill is done)
ALTER TABLE users ALTER COLUMN username SET NOT NULL;

-- Step 4: Create a trigger (optional) to keep them in sync during rollout
CREATE OR REPLACE FUNCTION method_sync_users() RETURNS TRIGGER AS $$
BEGIN
    NEW.username := NEW.user_name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_users BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE method_sync_users();
```

*Note: In reality, you would split this into multiple deploys.*

## Summary

Database migrations are the most "permanent" part of software engineering. Code is ephemeral; data is forever.

Treat your migration scripts with more respect than your application code. One bad line of SQL can end a company.

## Key Takeaways

- **Idempotency prevents errors**: Ensure your script can run twice without exploding (e.g., `IF NOT EXISTS`).
- **Locks need consideration**: Be careful with `ALTER TABLE` on large tables; it can lock the table for minutes.
- **Backups save careers**: Always take a snapshot before running a migration in Prod.

## Next Steps

- **Audit**: Check your `migrations` folder. Do you have `down` scripts?
- **Pipeline**: Add a CI step that runs `migrate up` then `migrate down` to verify reversibility.
- **Tooling**: Look into **pg-safeupdate** or similar tools to prevent accidental unlimited updates.
