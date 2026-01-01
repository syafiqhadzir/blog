---
layout: post
title: "Performance Budget Testing: Putting Your JavaScript on a Diet"
date: 2024-05-09
category: QA
slug: performance-budgets-testingqa
gpgkey: "EBE8 BD81 6838 1BAF"
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "One More Library" Syndrome](#the-one-more-library-syndrome)
- [Enforcement or It Didn't Happen](#enforcement-or-it-didnt-happen)
- [Code Snippet: Failing the Build on Size](#code-snippet-failing-the-build-on-size)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Your developers want to import `moment.js` (60KB) to format one date. They want `lodash` (70KB) to flatten one array. They are building a monster.

A Performance Budget is the only thing standing between your speedy app and a bloatware disaster. It is a hard limit. If you cross it, the build fails. No mercy.

## TL;DR

- **Size limits are mandatory**: JavaScript < 200KB (Gzipped). CSS < 50KB.
- **Time limits matter**: Time to Interactive (TTI) < 3.5s on 3G.
- **Images need compression**: No single image > 100KB unless it is the Mona Lisa (and even then, use WebP).

## The "One More Library" Syndrome

Developers love npm.

"I need a carousel." `npm install react-super-mega-carousel`.
"I need a toggle." `npm install react-toggle-v99`.

Suddenly, your internal dashboard needs 5MB of JS to render a `div`.

**QA Role**: Be the "Bad Cop". Reject the PR if the bundle size jumps by 10%.

## Enforcement or It Didn't Happen

If you just "suggest" a budget, nobody cares.

"We'll optimise it later," they say. (Narrator: They did not optimise it later).

You must integrate budget checks into the CI pipeline. Red build. Blocked merge. Sad developer. Happy user.

## Code Snippet: Failing the Build on Size

If you use Webpack, you can enforce limits directly in the config.

```javascript
// webpack.config.js
module.exports = {
  // ...
  performance: {
    // 'warning' is for cowards. Use 'error'.
    hints: 'error', 
    maxEntrypointSize: 250000, // 250KB max for the main bundle
    maxAssetSize: 250000, // 250KB max for any single file
  },
};
```

Or, use `bundlesize` in any CI environment (great for checking output files):

```json
// package.json configuration for bundlesize
{
  "bundlesize": [
    {
      "path": "./dist/main.bundle.js",
      "maxSize": "200 kB"
    },
    {
      "path": "./dist/*.css",
      "maxSize": "50 kB"
    }
  ]
}
```

## Summary

Performance is a feature. It is arguably the *most important* feature.

A budget forces the team to make trade-offs. "Do we really need this library? Or can we write 5 lines of code instead?"

## Key Takeaways

- **Tree Shaking must be verified**: Ensure your build tool is actually removing unused code. Testing imports is good; testing exports is better.
- **Code Splitting reduces initial load**: Do not load the "Admin Dashboard" code for the "Homepage" user. Use dynamic imports (`import()`).
- **Compression needs enabling**: Is Brotli enabled? It beats Gzip every time.

## Next Steps

- **Tool**: Use **Webpack Bundle Analyser** to visualise exactly what is taking up space (it draws pretty boxes).
- **Learn**: Read about **PRPL Pattern** (Push, Render, Pre-cache, Lazy-load).
- **Audit**: Check your `node_modules`. You might find five different versions of the same library (Dependency Hell).
