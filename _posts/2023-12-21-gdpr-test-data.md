---
layout: post
title: "GDPR and Test Data: Don't Clone Production (You Idiot)"
date: 2023-12-21
category: QA
slug: gdpr-test-data
gpgkey: EBE8 BD81 6838 1BAF
tags:
  [
    'compliance',
    'data-engineering',
    'hardware-testing',
    'security',
    'data-testing',
  ]
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Dump and Restore" Anti-Pattern](#the-dump-and-restore-anti-pattern)
- [Anonymisation vs. Pseudonymisation](#anonymisation-vs-pseudonymisation)
- [Code Snippet: The Faker Factory](#code-snippet-the-faker-factory)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

GDPR (General Data Protection Regulation) is the reason we have cookie banners
on every website. It is also the reason why copying your production database to
staging is now illegal (mostly).

If your staging environment contains real emails like `ceo@bigbank.com`, and you
accidentally send a test email to that address, you have not just made a
mistake. You have committed a data breach.

QA needs data that _looks_ real but is not.

## TL;DR

- **Synthetic Data is safest**: Use libraries like `Faker` to generate fake
  users.
- **Masking reduces risk**: If you must use Prod data, scrub PII (Personal
  Identifiable Information) _before_ it leaves the Prod VPC.
- **Right to be Forgotten needs testing**: Verify that the "Delete Account"
  button actually deletes the data (and does not just set `is_deleted=true`).

## The "Dump and Restore" Anti-Pattern

In 2010, it was common practice to `mysqldump` production and restore it to
staging. "It catches edge cases!" developers argued.

In 2023, this is a lawsuit waiting to happen. The moment a developer leaves
their laptop on the tube, that local copy of the DB is a liability.

**Rule #1 of Test Data**: If it is real, it stays in Prod. **Rule #2 of Test
Data**: If you think you need real data to test, your test coverage is bad.

## Anonymisation vs. Pseudonymisation

- **Anonymisation**: Data cannot be re-identified. (Good).
  - e.g., replacing "John Smith" with "User 492".
- **Pseudonymisation**: Data is masked but can be reversed with a key. (Risky).
  - e.g., replacing "John Smith" with "J**\* S\*\***".

For QA, we prefer **Synthetic Data**. It has zero risk.

## Code Snippet: The Faker Factory

Here is how to generate high-quality fake data using Python and `Faker`. Use
this to seed your staging DB.

```python
from faker import Faker
import json

fake = Faker('en_GB') # Use UK Locale for realistic postcodes

def generate_user():
    return {
        "name": fake.name(),
        "email": fake.email(),
        "address": {
            "street": fake.street_address(),
            "city": fake.city(),
            "postcode": fake.postcode()
        },
        "credit_card": fake.credit_card_number(card_type="visa"),
        "job": fake.job(),
        "gdpr_consent": True
    }

if __name__ == "__main__":
    # Generate 5 fake users
    users = [generate_user() for _ in range(5)]
    print(json.dumps(users, indent=2))

# Output example:
# {
#   "name": "Davina Jones",
#   "email": "harrissusan@example.org",
#   "address": { "city": "Port Christopher", ... }
# }
```

## Summary

Privacy is not just a legal box to tick. It is about respect.

If you treat your users' data like nuclear waste (handle with extreme care), you
will avoid the meltdown that comes with a leak.

## Key Takeaways

- **Seed Scripts generate safe data**: Write scripts to populate your staging DB
  with 10,000 fake users. It is cleaner and safer than scrubbing prod data.
- **Data Aging prevents rot**: Automate the deletion of test data. A staging DB
  from 2019 is of no use to anyone.
- **PII Scanner catches leaks**: Use tools like `git-secrets` to verify no PII
  accidentally ends up in your repo.

## Next Steps

- **Audit**: Ask your DBA: "Do we have real customer emails in Staging?"
- **Implement**: Create a `db:seed` script using Faker.
- **Verify**: Test the "Export My Data" (GDPR Subject Access Request) feature.
  Does it actually export _everything_?
