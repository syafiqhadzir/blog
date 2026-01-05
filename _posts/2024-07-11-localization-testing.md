---
layout: post
title: 'Localisation Testing: Why Your App is Illegal in Germany'
date: 2024-07-11
category: QA
slug: localization-testing
gpgkey: EBE8 BD81 6838 1BAF
tags: ['mobile-testing', 'philosophy']
description:
  'Internationalisation (i18n) is technical. Localisation (l10n) is cultural.'
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Date Formats: The American Arrogance](#date-formats-the-american-arrogance)
- [Currency: It's Not Just a Symbol](#currency-its-not-just-a-symbol)
- [Code Snippet: Validating Formats with Intl](#code-snippet-validating-formats-with-intl)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Internationalisation (i18n) is technical. Localisation (l10n) is cultural.

i18n is "Can we swap the text?" l10n is "Did we imply that the user's mother is
a hamster?"

If you launch your app in Germany without an "Impressum" (Legal Notice), you can
be sued. If you use the Thumbs Up emoji in the Middle East, you (historically)
insulted someone.

QA's job is to ensure you do not accidentally start a diplomatic incident.

## TL;DR

- **Dates cause confusion**: DD/MM/YYYY vs MM/DD/YYYY. If you get this wrong, a
  user misses their flight by 5 months.
- **Numbers vary by locale**: 1,000.00 (UK) vs 1.000,00 (Spain). A decimal point
  difference can bankrupt a user.
- **Legal requirements differ**: GDPR in Europe, CCPA in California. Are the
  consent banners correct?

## Date Formats: The American Arrogance

Americans use MM/DD/YYYY. Everyone else (mostly) uses DD/MM/YYYY. ISO-8601
(YYYY-MM-DD) stands alone as the only sane format.

**QA Test**: Go to your profile settings. Change region to "UK". Does
`04/05/2024` mean "May 4th" or "April 5th"?

If it is ambiguous, use long formats ("4 May 2024"). The best QA test is
entering a birth date like `31/01/1990` and seeing if the backend validation
fails because it thinks the month is `31`.

## Currency: It's Not Just a Symbol

"Price: $100". Which Dollar? US? Canadian? Australian? Singaporean?

"Price: 100 Kr". Swedish, Danish, or Norwegian Krone?

You must display the ISO code (USD, CAD) or precise symbol logic. Also, in
Japan, there are no decimals in Yen (usually). `¥100.00` just looks weird.
`¥100` is correct.

## Code Snippet: Validating Formats with Intl

Browser `Intl` API is powerful. Use it in your tests to verify outputs match the
locale, instead of regexing for commas.

```javascript
/*
  l10n.spec.js
*/
test('should format currency correctly for Germany', () => {
  const price = 1234.56;
  const locale = 'de-DE';
  const currency = 'EUR';

  // The Expected Output
  // Germany uses space or dot for thousands, and comma for decimal
  // Expected Output: "1.234,56 €"
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  });

  const output = formatter.format(price);

  // Note: Non-breaking space (\u00A0) might trigger assertion errors
  // depending on your test runner's string normalisation.
  // Use a regex to be safe.
  expect(output).toMatch(/1\.234,56\s€/);

  console.log(`Formatted Price (DE): ${output}`);
});
```

## Summary

Localisation is about respect. It shows the user: "We built this for _you_, not
just for people in San Francisco."

A well-localised app feels native. A poorly localised app feels like a tourist
who shouts in English hoping to be understood.

## Key Takeaways

- **Input Fields need locale awareness**: Does the postcode field accept
  letters? (UK/Canada: Yes. US: No). If you validate `^\d{5}$`, you just blocked
  the UK.
- **Names vary globally**: "First Name" and "Last Name" is a western concept.
  Many cultures have one name, or family name first. Just use "Full Name".
- **Colours have cultural meaning**: Red means "Stop/Danger" in the West. It
  means "Luck/Wealth" in China. Your "Delete" button might look "Lucky".

## Next Steps

- **Tool**: Use **VPNs** to test geoblocked content and automatic region
  detection.
- **Learn**: Study **ISO 3166** (Country Codes) and **ISO 4217** (Currency
  Codes). Memorise them properly.
- **Audit**: Check your SMS verification. Do you support country codes like
  `+44` and `+81`?
