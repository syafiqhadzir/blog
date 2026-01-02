---
layout: post
title: 'Identity Federation Testing: Digital Diplomacy'
date: 2025-01-23
category: QA
slug: identity-federation-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Trust Relationship](#the-trust-relationship)
- [Attribute Mapping Hell](#attribute-mapping-hell)
- [Code Snippet: Validating Claims](#code-snippet-validating-claims)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

"Login with Your Work Account."
"Login with Google."

You are on `HR-App.com`, but you enter your password on `Corporate-IDP.com` (Okta/Azure). This is Federation. It is
digital diplomacy.

It is like showing your Passport (issued by government) to a Hotel (service provider). The Hotel does not know you, but
it trusts the Government. If the Government says "This is Dave", the Hotel says "Here is your room key".

## TL;DR

- **IdP (Identity Provider)**: The issuer of the passport (e.g., Okta, Azure AD, Auth0).
- **SP (Service Provider)**: The hotel accepting the passport (e.g., Salesforce, Slack, Your App).
- **Protocol options**: SAML (XML-based, old, enterprise) or OIDC (JSON-based, new, web-friendly).

## The Trust Relationship

Federation relies on a mutually agreed "Circle of Trust". If I steal the IdP's Signing Key, I can forge a passport. I
can become "CEO Dave" and login to the Payroll system.

**QA Strategy**: Test the **Signing Certificate Rotation**. Certificates expire. When Ops updates the cert on the IdP,
did they update it on the SP? Test scenario: Use an expired certificate. Login must fail.

## Attribute Mapping Hell

IdP sends: `givenName: "Dave"`.
SP expects: `FirstName: "Dave"`.
Result: "Welcome, Undefined". User profile is created with empty name.

IdP sends: `groups: ["admins"]`.
SP expects: `groups: ["Administrators"]`.
Result: Dave logs in but has no permissions.

Attribute Mapping is the #1 cause of Federation bugs. QA must verify that every field (Email, Department, Role) lands in
the correct bucket.

## Code Snippet: Validating Claims

You cannot easily automate the full third-party login flow (MFA blocks you), but you can unit test the **Token Parsing**
logic.

```javascript
/*
  auth-claims.spec.js
*/
const { parseIdentityToken } = require('../src/auth/utils');

test('should map Department attribute correctly from SAML', () => {
  // Mock SAML Assertion (Decoded)
  const userPayload = {
    email: 'test@example.com',
    // The messy part: Different IdPs send different keys
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/department': 'Quality Assurance',
    'custom_role_attribute': 'Editor'
  };

  const user = parseIdentityToken(userPayload);

  // The application's normalised user object
  expect(user.department).toBe('Quality Assurance');
  expect(user.role).toBe('Editor');
});

test('should fail if email is missing', () => {
    const invalidPayload = { name: 'No Email' };
    expect(() => parseIdentityToken(invalidPayload)).toThrow('Missing mandatory claim: email');
});
```

## Summary

Federation is fragile. It involves two companies who do not talk to each other exchanging crypto-signed XML/JSON around
the world.

What could go wrong? Everything. Test the boundaries. Especially what happens when the IdP is down (Do we have a
backdoor local admin?).

## Key Takeaways

- **Deep Linking (RelayState)**: If I click a link to "Invoice #101" in an email, then login, do I land on "Invoice
  #101" or the "Dashboard"?
- **Logout is often broken**: Just because I logged out of the App does not mean I logged out of the IdP. Single Sign-On
  often means "Single Sign-Out" is broken.
- **Encryption is mandatory**: SAML assertions should be encrypted in transit. Do not send PII (National Insurance
  Numbers) in cleartext XML.

## Next Steps

- **Tool**: Use **SAML-tracer** (Firefox/Chrome Extension) to see the raw XML exchange. It is indispensable.
- **Learn**: Understand **OpenID Connect Discovery** (`.well-known/openid-configuration`). It automates the setup.
- **Audit**: Check your "Skew Allowance". If your server time is off by 2 minutes from the IdP, do logins fail?
  (NotBefore / NotOnOrAfter timestamps).
