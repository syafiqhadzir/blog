---
layout: post
title: 'Headless CMS Testing: When Editors Attack'
date: 2024-12-05
category: QA
slug: headless-cms-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [Preview Mode Magic](#preview-mode-magic)
- [The "5,000 Character Title"](#the-5000-character-title)
- [Code Snippet: Auth for Preview Mode](#code-snippet-auth-for-preview-mode)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

A Headless CMS (Contentful, Sanity, Strapi) separates data from display. This gives infinite power to the Editors. Use
it wisely.

An Editor *will* upload a 50MB BMP image directly from their DSLR camera. An Editor *will* create a nested recursive
category loop (Parent = Self). An Editor *will* copy-paste from MS Word and inject weird XML tags into your clean HTML.

QA must protect the Frontend from the Content.

## TL;DR

- **Validation prevents chaos**: Enforce limits in the CMS (e.g., Title max 50 chars). Do not trust the frontend to
  truncate gracefully.
- **Rich Text needs security testing**: Test bold, italic, links, and malicious script injection in the text editor.
  (XSS via CMS is real).
- **Webhooks must fire reliably**: When content changes, does the webhook fire? Does the site rebuild? If not, the
  Editor will Slack you: "Why isn't it live?"

## Preview Mode Magic

Editors need to see changes *before* publishing. "Preview Mode" bypasses static generation to show live draft content.
It usually requires a secret token and a cookie handshake.

If this breaks, Editors fly blind. They *hate* flying blind.

**QA Strategy**: Can I access Preview Mode without the token? (Security Risk). Can I share the Preview URL with a
colleague?

## The "5,000 Character Title"

Developer: "The design assumes 1 line for the title."
Editor: "I wrote a paragraph because it's good for SEO."
Result: Design breaks. Layout shifts. Text overflows the card and covers the "Buy" button.

**QA Strategy**: Create a "Stress Test" content entry in the CMS called "QA Chaos". Fill every field with maximum length
strings, Emojis, and Right-to-Left text. Does the UI survive? (CSS `text-overflow: ellipsis` and `line-clamp` are your
friends).

## Code Snippet: Auth for Preview Mode

Automate the testing of protected preview routes using Playwright. This verifies that the handshake works and we can see
Draft content.

```javascript
/*
  cms-preview.spec.js
*/
const { test, expect } = require('@playwright/test');

test('should render draft content in Preview Mode', async ({ page }) => {
  // 1. Visit the API route to set the Preview Cookie
  // This simulates the CMS "Open Preview" button click
  const secret = process.env.PREVIEW_SECRET;
  const slug = 'qa-draft-post';
  
  // The API route usually checks the secret and sets a cookie
  await page.goto(`/api/preview?secret=${secret}&slug=${slug}`);
  
  // 2. Browser now has __prerender_bypass / __next_preview_data cookies
  // Determine if cookie was set
  const cookies = await page.context().cookies();
  const previewCookie = cookies.find(c => c.name.includes('preview') || c.name.includes('bypass'));
  expect(previewCookie).toBeDefined();

  // 3. Visit the actual page
  await page.goto(`/posts/${slug}`);
  
  // 4. Verify we see the Draft banner (Visual confirmation)
  await expect(page.locator('.preview-mode-banner')).toBeVisible();
  
  // 5. Verify draft content is present
  await expect(page.locator('h1')).toContain('DRAFT VERSION');
  
  // 6. Test "Exit Preview"
  await page.goto('/api/exit-preview');
  await expect(page.locator('.preview-mode-banner')).not.toBeVisible();
});
```

## Summary

Headless CMS projects fail because Devs and Editors speak different languages. Devs speak JSON and components. Editors
speak "Storytelling" and "Campaigns".

QA is the translator. Ensure the JSON supports the Story. And never underestimate the destructive power of a bored
Editor with a Rich Text field.

## Key Takeaways

- **Image Focal Point needs verification**: If the CMS allows setting a focal point (e.g., "Face is here"), does the
  frontend respect it? Or did we just crop off the CEO's head?
- **Required Fields must handle nulls**: If an optional field is empty, does the page crash? (`TypeError: cannot read
  property 'url' of null`). Handle nulls defensively.
- **Scheduling requires testing**: Publish a post scheduled for 5 mins from now. Does it appear automatically? Or do you
  need a cron job to rebuild the site?

## Next Steps

- **Tool**: Use **Storybook** to test components with various mock data lengths (Empty, Short, Long, Extremely Long).
- **Learn**: Read about **Structured Content** (sanity.io/guide). It is the future (and past) of the web.
- **Audit**: Check your CMS Asset CDN. Are images optimised, or are we serving raw 4K uploads? (Use `format=auto`
  queries).
