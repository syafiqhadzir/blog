---
layout: post
title: 'The QA Role in Feature Flags: The Kill Switch'
date: 2023-06-01
category: QA
slug: qa-role-feature-flags
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
---## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Permutation Explosion](#the-permutation-explosion)
- [The Dangerous 'Default True'](#the-dangerous-default-true)
- [Code Snippet: Safer Implementation](#code-snippet-safer-implementation)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Back in the day, releases were terrifying events. We would deploy on Friday at 5 PM (because we hate ourselves) and pray.

Today, we have **Feature Flags** (or Toggles). They verify that "Deployment != Release". You can deploy code now, but "release" it to users next Tuesday.

For developers, it is a dream. For QA, it can be a nightmare. Why? Because you just turned one application into two: the version with the flag `ON` and the version with the flag `OFF`. Add 10 flags, and you have $$2^{10}$$ (1,024) versions of your app to test.

## TL;DR

- **Matrix testing is impossible**: Testing every flag combination is impossible. Prioritise "All On" and "All Off".
- **Safety requires defaults**: Ensure the feature defaults to `OFF` if the flag service crashes.
- **Cleanup prevents debt**: A stale flag is technical debt. Delete it after the rollout.

## The Permutation Explosion

A feature flag splits your code path.

- **Flag A**: New Checkout.
- **Flag B**: Dark Mode.
- **Flag C**: Stripe Integration.

If I turn on `New Checkout` but leave `Stripe Integration` off, does the checkout crash? Probably.

QA cannot test every permutation. We are not robots. The strategy here is **Risk-Based Testing**:

1. **Production State**: Test the specific configuration currently live.
2. **Target State**: Test the configuration you intend to release next.
3. **The "Oh No" State**: Test what happens if the flag service (LaunchDarkly, Split.io) goes down. Does the app crash, or does it gracefully degrade?

## The Dangerous 'Default True'

The scariest code I see is this:

```javascript
const isEnabled = await flags.get('new-feature', true); // Defaulting to TRUE
```

If the flag service fails, you just accidentally released a beta feature (likely broken) to 100% of your users. Always default to `false` (safe).

## Code Snippet: Safer Implementation

Here is a robust pattern for implementing flags in a React hook, ensuring a safe fallback.

```typescript
// hooks/useFeatureFlag.ts
import { useFlags } from 'launchdarkly-react-client-sdk';

export const useFeatureFlag = (flagKey: string, defaultValue: boolean = false) => {
  const flags = useFlags();
  
  // Safety: If the SDK hasn't initialised, return the safe default
  if (!flags) {
    console.warn(`⚠️ Flag SDK not ready. Defaulting ${flagKey} to ${defaultValue}`);
    return defaultValue;
  }

  // The null coalescing operator (??) is your best friend here.
  return flags[flagKey] ?? defaultValue;
};

// Component Usage
const CheckoutButton = () => {
    // If LaunchDarkly is down, NOBODY sees the button
    const isNewCheckout = useFeatureFlag('enable-super-checkout', false);

    return isNewCheckout ? <SuperCheckout /> : <OldCheckout />;
};
```

This ensures that network failures do not turn your users into accidental beta testers.

## Summary

Feature flags are the most powerful tool in the DevOps arsenal, allowing you to test in production with zero risk to the general public. But they are borrowed time. Every `if (flag)` statement is technical debt.

QA's role is not just to verify the feature, but to verify the **removal** of the flag once the feature is stable.

## Key Takeaways

- **Decouple deployments**: Using flags allows big messy merges without breaking Production.
- **Test the Toggle**: Do not just test the feature; test flipping the switch whilst the user is using it. Does the UI update in real-time?
- **Audit regularly**: Review your flags monthly. If a flag has been `true` for 45 days, it is not a flag anymore; it is just code. Delete it.

## Next Steps

- **Audit**: Go through your LaunchDarkly dashboard and find flags untouched for >3 months.
- **Ticket**: Create "Death to Flags" tickets to remove old conditionals.
- **Matrix**: Create a simple spreadsheet for your next release defining exactly which flags will be Active/Inactive.
