---
layout: post
title: 'PCI Compliance Testing: How to Not Get Sued'
date: 2023-12-14
category: QA
slug: pci-compliance
gpgkey: EBE8 BD81 6838 1BAF
tags:
- compliance
- strategies
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Tokenisation Trick](#the-tokenisation-trick)
- [Logs: The Silent Leak](#logs-the-silent-leak)
- [Code Snippet: The Redactor](#code-snippet-the-redactor)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

PCI DSS (Payment Card Industry Data Security Standard) sounds boring. It is. But it is the "boring" that keeps your
company from being fined into bankruptcy.

If you think "Security is simpler if we just store the credit card in the database," please close this browser and go
back to welding underwater. It is safer.

For QA, PCI compliance means ensuring we never, ever touch the raw data.

## TL;DR

- **Do not touch it**: Use Stripe Elements or Braintree Hosted Fields.
- **Do not log it**: Grep your logs for `4[0-9]{12}(?:[0-9]{3})?` (Visa Regex).
- **Encrypt it**: If it moves, it must be HTTPS.

## The Tokenisation Trick

The best way to secure data is to not have it. Modern payments use **Tokenisation**.

1. The Frontend sends the card to the Provider.
2. The Provider gives back a token (e.g., `tok_123`).
3. Your server only ever sees `tok_123`.

If hackers steal your database, they get a list of useless tokens.

**QA Challenge**: Intercept the network request from the browser. Does the request go to `api.yourcompany.com`? FAIL. It
must go to `api.stripe.com`.

## Logs: The Silent Leak

Developers love logging.
`logger.info("Received payload: " + JSON.stringify(payload))`

This line of code has caused more data breaches than any sophisticated zero-day exploit.

If the payload contains `credit_card_number`, you have just written a crime into a text file.

## Code Snippet: The Redactor

Here is a Python Log Filter that ensures you do not accidentally log a credit card number.

```python
import logging
import re

class CreditCardRedactor(logging.Filter):
    # Regex for finding Visa/Mastercard (simplified)
    # Looks for 13-16 digits with optional spaces/dashes
    CC_PATTERN = re.compile(r'\b(?:\d[ -]*?){13,16}\b')

    def filter(self, record):
        if type(record.msg) is str:
            record.msg = self.redact(record.msg)
        return True

    def redact(self, msg):
        return re.sub(self.CC_PATTERN, '[REDACTED PAN]', msg)

# Usage
logger = logging.getLogger(__name__)
handler = logging.StreamHandler()
handler.addFilter(CreditCardRedactor())
logger.addHandler(handler)
logger.setLevel(logging.INFO)

def process_payment(card_number):
    # Even if the dev makes a mistake...
    logger.info(f"Processing payment for card: {card_number}")

# ...the log stays safe
process_payment("4242 4242 4242 4242") 
# Output: "Processing payment for card: [REDACTED PAN]"
```

## Summary

Compliance is not just a checklist; it is a culture.

It only takes one developer `print()`-ing a variable to debug a production issue to violate PCI DSS Level 1. Be the QA
who catches that `print()`.

## Key Takeaways

- **Auto-Complete needs disabling**: Disable it on CC inputs (`autocomplete="off"`). You do not want the browser saving
  the user's card on a shared computer.
- **Dependencies need auditing**: Audit your third-party scripts. If you have a sketchy "Analytics" script on your
  checkout page, it can read the credit card field.
- **Data Retention needs limits**: Do not keep user data longer than necessary. "Data is a toxic asset."

## Next Steps

- **Sanitise**: Run a script to scan your existing logs/DB for 16-digit numbers.
- **Review**: Check your `robots.txt` and ensure you are not indexing invoice pages.
- **Training**: Slap the hand of any developer who suggests "just base64 encoding it".
