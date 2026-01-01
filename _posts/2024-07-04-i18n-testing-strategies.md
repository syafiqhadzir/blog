---
layout: post
title: "Internationalisation Testing: Finding the 'Ok' Button in German"
date: 2024-07-04
category: QA
slug: i18n-testing
gpgkey: "EBE8 BD81 6838 1BAF"
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Hardcoded" Horror](#the-hardcoded-horror)
- [Pluralisation Panic](#pluralisation-panic)
- [Code Snippet: Hunt for Hardcoded Strings](#code-snippet-hunt-for-hardcoded-strings)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Internationalisation (i18n) is the process of extracting hardcoded strings from your app so you can eventually replace them with longer German words that break your layout.

Developers love to hardcode "Cancel" because typing `t('actions.cancel')` is too much effort. QA's job is to find every "Submit", "Loading...", and "Error!" that is not wrapped in a translation function.

If you think "Globalisation" just means changing the flag icon, you are in for a world of pain.

## TL;DR

- **Expansion breaks layouts**: German text is typically 30% longer than English. Does it overlap the button or cut off?
- **Plurals are complex**: "1 File", "2 Files". Russian has 3 plural forms. Arabic has 6. Your `if (n == 1)` logic is insufficient.
- **Pseudo-Loc reveals bugs instantly**: Use `[!!! Łööööádîñg !!!]` to spot hardcoded strings instantly. If you see "Loading", it is a bug.

## The "Hardcoded" Horror

You switch the app to French. Everything says "Bonjour", "Bienvenue". You click save.

A toast pops up: "Successfully saved!" (in English). You have failed.

Hardcoded strings are sneaky. They hide in error messages, API responses (`500 Server Error`), and date formatters.

**QA Strategy**: Do not test in English. Test in "Pseudo-English" (Accented characters). If you see normal English, it is a bug.

## Pluralisation Panic

"You have 0 message(s)."

This is lazy. But it gets worse. In Polish, 1 file is "plik". 2, 3, 4 files are "pliki". 5-21 files are "plików".

If your dev used a ternary operator `count === 1 ? 'file' : 'files'`, they have insulted the entire Slavic language family.

Use a proper library like `i18next` or `react-intl` that handles CLDR plural rules.

## Code Snippet: Hunt for Hardcoded Strings

You cannot manually check every file. Use grep to find shame.

This bash one-liner looks for text inside JSX tags that is not wrapped in a translation helper (assuming React/i18next).

```bash
#!/bin/bash
# find-shame.sh
# Find text inside <div> or <p> that doesn't use t() or <Trans>

grep -rE ">[a-zA-Z]+<" ./src/components \
  | grep -v "Trans" \
  | grep -v "FormattedMessage" \
  | grep -v "t(" \
  | grep -v "console.log"

# Explanation:
# -rE: Recursive extended regex
# ">[a-zA-Z]+<": Looks for letters sandwiched between > and < tags
# grep -v: Excludes lines that are probably okay (using translation components)
```

A better approach is using `eslint-plugin-i18n-json` or `eslint-plugin-react-i18n` to verify this at build time.

## Summary

i18n is not just about translation. It is about architecture.

If you build flexibility in from Day 1, launching in Japan is easy. If you hardcode "MM/DD/YYYY" everywhere, you will never leave the USA.

And remember: Right-to-Left (RTL) languages exist. Flip your CSS logic. `margin-left` becomes `margin-right`.

## Key Takeaways

- **Concatenation breaks localisation**: Never do `"Welcome " + username`. In some languages, the username comes first, or in the middle. Use placeholders: `t('welcome', { name: username })`.
- **Images with text cannot be translated**: Do not put text inside images. You cannot translate a `.png` without Photoshop. Use CSS overlays.
- **Sorting differs by locale**: "Zebra" comes after "Apple". But does "Ångström" come after "Zebra" or "Apple"? It depends on the locale. Use `localeCompare`.

## Next Steps

- **Tool**: Enable **Pseudo-localisation** in your i18n library immediately. It extends strings by 30% and adds accents.
- **Learn**: Read about **Unicode CLDR** (Common Locale Data Repository). It is the bible of formatting.
- **Audit**: Switch your OS language to something you do not speak and try to use your app. Good luck.
