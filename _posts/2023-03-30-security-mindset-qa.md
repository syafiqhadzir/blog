---
layout: post
title: "Security Mindset for QA: Thinking Like a Villain"
date: 2023-03-30
category: QA
slug: security-mindset-qa
gpgkey: "EBE8 BD81 6838 1BAF"
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Evil Path](#the-evil-path)
- [Beyond Functional Testing](#beyond-functional-testing)
- [Code Snippet: The XSS Payload](#code-snippet-the-xss-payload)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Security is often relegated to a separate department ("The SecOps Guys" who reside in a dark basement). But the first line of defence is the QA engineer.

Adopting a "Security Mindset" means stopping to ask: "This feature works, but how can I abuse it to ruin someone's day?"

If you can paste the entire script of *Bee Movie* into your login field, or if putting a negative number in "Quantity" refunds your credit card, you have a problem.

## TL;DR

- **Sanitisation is mandatory**: All user input is guilty until proven innocent.
- **Authorisation needs testing**: Just because I can see a button does not mean I should be able to click it.
- **Headers need checking**: Check your security headers (CSP, HSTS).
- **Tools automate basics**: Automate basic scans with ZAP or Burp Suite.

## The Evil Path

Most QA engineers check the "Happy Path" (User logs in) and the "Sad Path" (User uses wrong password).

The Security QA checks the **Evil Path**:

- User logs in with username `admin' --`.
- User changes the URL ID from `/user/10` to `/user/1` to see the CEO's profile (IDOR).
- User uploads a file named `hack.exe.png`.

A security flaw is just a bug with a tuxedo on. It is an unintended behaviour that allows for exploitation.

## Beyond Functional Testing

Functional testing asks: "Does the door open when I turn the handle?"

Security testing asks: "Does the door open if I take the hinges off with a screwdriver?"

One of the most common vulnerabilities is **XSS (Cross-Site Scripting)**, where an attacker injects a script into your page that executes for other users.

## Code Snippet: The XSS Payload

Here is a Cypress test that attempts to inject a malicious script into a comment field. If the application is secure, it should not execute the script.

```javascript
describe('Security: XSS Input Validation', () => {
  it('should escape malicious script tags in comments', () => {
    const maliciousPayload = "<script>alert('Hacked')</script>";
    
    // We expect the app to convert < to &lt; (HTML Entity)
    // The browser renders it as text, not code.
    const safeOutput = "&lt;script&gt;alert('Hacked')&lt;/script&gt;";

    cy.visit('/comments');
    
    // 1. Inject the payload
    cy.get('#comment-box').type(maliciousPayload);
    cy.get('#submit-btn').click();

    // 2. Verify it appears in the list
    cy.get('.comment-list').should('contain', maliciousPayload);
    
    // 3. CRITICAL: Verify the alert was NOT called
    // We check the raw HTML to ensure sanitisation
    cy.get('.comment-list').then(($list) => {
       const html = $list.html();
       // If we see raw <script> tags, we failed.
       expect(html).to.contain('&lt;script&gt;'); 
       expect(html).not.to.contain('<script>');
    });
  });
});
```

If this test fails (i.e., the raw `<script>` tag is present), you have a **Critical** high-severity vulnerability. Call the developers. Wake them up.

## Summary

Quality includes security. If your app works perfectly but leaks credit card numbers, it is not a high-quality app; it is a lawsuit.

You do not need to be a penetration tester to catch 80% of security bugs; you just need to be a suspicious QA.

## Key Takeaways

- **IDOR needs testing**: Insecure Direct Object References. Always try changing IDs in the URL.
- **Rate Limiting prevents abuse**: What happens if I click "Submit" 100 times in 1 second?
- **Logs need auditing**: Ensure you are not logging passwords or tokens in plain text.

## Next Steps

- **Fuzz**: Use a "Fuzz List" of nasty strings (SQL injection, Emoji, massive text) for every input field.
- **Scan**: Run an OWASP ZAP baseline scan against your staging environment.
- **Learn**: Read the "OWASP Top 10" report. It is terrifying.
