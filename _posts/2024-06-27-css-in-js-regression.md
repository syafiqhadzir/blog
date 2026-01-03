---
layout: post
title: 'CSS-in-JS Regression Testing: Regressing in Style'
date: 2024-06-27
category: QA
slug: css-in-js-regression
gpgkey: EBE8 BD81 6838 1BAF
tags: ["regression-testing", "frontend-testing"]
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Computed" Truth](#the-computed-truth)
- [Dynamic Props: The Silent Killer](#dynamic-props-the-silent-killer)
- [Code Snippet: Testing Styled Components with Jest](#code-snippet-testing-styled-components-with-jest)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

CSS-in-JS (Styled-components, Emotion) allows developers to write CSS in JavaScript files. It sounds like heresy, but it
works.

The problem: Class names are now `sc-aXZVg`. Good luck verifying that in a Selenium script.

QA must move beyond "Class Name Inspection" to "Computed Style Verification". If you are still writing XPaths like
`//div[@class='btn-primary']`, you are already dead.

## TL;DR

- **Computed Styles reveal truth**: Ask the browser "What colour is this?" not "What class does it have?".
- **Theming needs verification**: Verify that changing the Theme Provider actually updates the button colours.
- **Snapshotting catches drift**: Use `jest-styled-components` to catch unexpected style changes in code reviews.

## The "Computed" Truth

Browser: `<button class="sc-fzoLag jXyZf">`.
QA: "Is it red?"

The only way to know is `window.getComputedStyle()`. Do not rely on the hashed class name. It changes every time the
developer sneezes (or updates the library).

In Playwright, use `expect(locator).toHaveCSS('background-color', 'rgb(255, 0, 0)')`. Note the RGB format; browsers
normalise colours.

## Dynamic Props: The Silent Killer

Developer logic: `background: ${props => props.isActive ? 'red' : 'blue'}`.

**QA Test**:

1. Render component with `isActive={true}`.
2. Assert background is red.
3. Render component with `isActive={false}`.
4. Assert background is blue.

If you skip step 3, you are not testing the logic; you are just admiring the colour. Also, verify that `isActive` is not
leaking into the DOM as a valid HTML attribute (causing React warnings).

## Code Snippet: Testing Styled Components with Jest

You do not need to spin up a browser to test basic style logic. Jest is fast.

```javascript
/*
  button.test.js
  Verifying style logic without a browser.
*/
import React from 'react';
import styled from 'styled-components';
import { render } from '@testing-library/react';
import 'jest-styled-components'; // The magic sauce

const Button = styled.button`
  background: ${props => props.primary ? 'palevioletred' : 'white'};
  color: ${props => props.primary ? 'white' : 'palevioletred'};
  
  &:hover {
    background: grey;
  }
`;

test('it renders the primary style', () => {
  const { getByRole } = render(<Button primary>Click Me</Button>);
  
  // This asserts on the actual computed CSS rules generated
  // It checks that the class generated has these rules
  expect(getByRole('button')).toHaveStyleRule('background', 'palevioletred');
  expect(getByRole('button')).toHaveStyleRule('color', 'white');
});

test('it handles hover states', () => {
    const { getByRole } = render(<Button>Click Me</Button>);
    
    // Testing pseudo-classes
    expect(getByRole('button')).toHaveStyleRule('background', 'grey', {
        modifier: ':hover'
    });
});
```

## Summary

CSS-in-JS is powerful but opaque. If you treat the DOM as a black box and only look at the final rendered pixels (or
computed styles), you will be safe from the churn of hashed class names.

But seriously, talk to your devs about "Stable Selectors" (`data-testid`).

## Key Takeaways

- **Performance has runtime cost**: Generating CSS at runtime is slow. Check your "Style Injection" cost in the
  Performance tab. Zero-runtime libs (Vanilla Extract) are the future.
- **Specificity can flatten**: CSS-in-JS libraries often flatten specificity. Ensure your overrides work.
- **Dead Code accumulates**: It is easy to leave unused styles in JS files. Use a linter like `stylelint`.

## Next Steps

- **Tool**: Use **Chromatic** or **Percy** for visual regression testing at the pixel level. Robots are better at
  spotting 1px shifts than you are.
- **Learn**: Understand the **CSSOM** (CSS Object Model) and how JS writes to it.
- **Audit**: Verify that your Critical CSS is being extracted for Server-Side Rendering (SSR). If the screen flashes
  unstyled content (FOUC), you failed.
