---
layout: post
title: 'Shadow DOM Testing: Piercing the Veil'
date: 2024-06-20
category: QA
slug: shadow-dom-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Encapsulation" Wall](#the-encapsulation-wall)
- [CSS Variables: The Loophole](#css-variables-the-loophole)
- [Code Snippet: Piercing the Shadow Root](#code-snippet-piercing-the-shadow-root)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Web Components are cool. They let you hide your shame (and your CSS) inside a Shadow Root. The Shadow DOM is a fortress.

Selenium tries to get in, but the drawbridge is up. QA's job is to be the ninja that scales the walls and verifies that
the `<span>` inside really is red.

If you are testing Salesforce LWC or Polymer apps, this is your daily life.

## TL;DR

- **Selection differs**: Regular `document.querySelector` returns `null` for shadow elements. You need special tools.
- **Events are retargeted**: Events inside Shadow DOM are "retargeted". A click on a button inside a component looks
  like a click on the component itself.
- **Styling is encapsulated**: Your global `bootstrap.css` has no power here.

## The "Encapsulation" Wall

Developers love Shadow DOM because "Global CSS is hard". QA hates Shadow DOM because "Global Automation is hard".

If you try to find `#submit-btn` and it lives in `<login-form>`, your test fails. Standard libraries are slowly catching
up, but many legacy tools still hit the wall.

If you are using Cypress, you need to enable `includeShadowDom: true` in your config.

## CSS Variables: The Loophole

The only thing that crosses the Shadow boundary is CSS Variables (`--main-color`).

**QA Scenario**: The Designer changes `--error-color` to `pink` (designers are wild). Does the Web Component pick it up?
Or did the developer hardcode `#ff0000` inside the component like a savage?

Automated Visual Regression testing (BackstopJS, Percy) is essential here because functional tests will not catch the
colour mismatch.

## Code Snippet: Piercing the Shadow Root

Playwright makes this laughably easy because it pierces Shadow DOM by default. Selenium requires a bit more gymnastics.

```javascript
/*
  shadow.spec.js
*/
const { test, expect } = require('@playwright/test');

test('should click button inside Shadow DOM', async ({ page }) => {
  await page.goto('/components');

  // HTML Structure:
  // <user-card>
  //   #shadow-root
  //     <button class="follow">Follow</button>
  // </user-card>
  
  // Playwright automatically pierces open Shadow Roots!
  // No need for user-card >> .follow syntax (though that works too)
  await page.locator('user-card .follow').click();
  
  await expect(page.locator('user-card .status')).toHaveText('Following');
});
```

If you are stuck with **Selenium**, you must use JavaScript execution (gross):

```javascript
const button = await driver.executeScript(`
  return document.querySelector('user-card').shadowRoot.querySelector('.follow')
`);
await button.click();
```

## Summary

The Shadow DOM gives developers peace of mind. It gives QA engineers nightmares.

But modern tools have turned those nightmares into mild inconveniences. Use them. If your automation engineer proposes
writing a custom `openShadowRoot()` helper function, sack them and switch to Playwright.

## Key Takeaways

- **Closed Mode blocks access**: If a developer uses `mode: 'closed'`, you cannot access the shadow root from JS. Tell
  them to stop being paranoid. There is no valid use case for this in internal apps.
- **Slots are tricky**: Testing content injected into `<slot>` is tricky. It renders inside, but logically lives outside
  (Light DOM). Know the difference.
- **Forms need ElementInternals**: Form inputs inside Shadow DOM do not participate in the parent `<form>` submission
  automatically unless the dev implements `ElementInternals`. Verify the data actually submits.

## Next Steps

- **Tool**: Use **Playwright** or **Puppeteer**. They handle this natively.
- **Learn**: Read about **Constructable Stylesheets**.
- **Audit**: Check if your accessibility tools (Axe) can see inside the Shadow DOM (most modern ones can, but verify).
