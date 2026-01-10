# Bleeding-Edge Linting Configuration

**Last Updated**: 2026-01-10  
**Status**: ✅ STRICTEST ENFORCEMENT ENABLED

## Overview

This repository enforces **bleeding-edge strictest** linting standards across
all supported languages and frameworks. These configurations represent the most
rigorous code quality standards available as of 2026.

---

## 🔥 ESLint (JavaScript/TypeScript)

### Enhanced Strictness

- **Complexity Limits** (Stricter than industry standard):
  - Cyclomatic complexity: **6** (reduced from 8)
  - Max depth: **2** (reduced from 3)
  - Max lines per file: **150** (reduced from 200)
  - Max lines per function: **50** (reduced from 60)
  - Max nested callbacks: **2** (reduced from 3)
  - Max statements: **15** (reduced from 20)

- **New Strict Rules** (20+ additions):
  - `prefer-template`: Enforce template literals
  - `no-else-return`: Simplify control flow
  - `object-shorthand`: Modern ES6+ syntax
  - `prefer-destructuring`: Object destructuring
  - `eqeqeq`: Strict equality only
  - `yoda`: No Yoda conditions

### TypeScript Excellence

- **15+ New Strictest Rules**:
  - `no-unnecessary-condition`: Catch redundant checks
  - `prefer-enum-initializers`: Explicit enum values
  - `prefer-regexp-exec`: Performance optimization
  - `no-confusing-non-null-assertion`: Type safety
  - `no-redundant-type-constituents`: Clean types

### SonarJS Cognitive Complexity

- Reduced to **8** (from 10) for maximum maintainability
- `no-duplicate-string` with threshold of **3**
- `no-identical-functions` enabled

### Unicorn Enhanced

- 7 new strict rules including:
  - `prefer-array-some`
  - `prefer-date-now`
  - `prefer-number-properties`
  - `throw-new-error`

---

## 🎨 Stylelint (CSS/SCSS)

### Strictest CSS Standards

- **Reduced Limits**:
  - Selector max specificity: **`0,2,1`** (from `0,3,1`)
  - Max combinators: **2** (from 3)
  - Max pseudo-class: **2** (from 3)
  - Max type selectors: **2** (from 3)
  - Number precision: **3** decimals (from 4)

- **New Prohibited Patterns**:
  - ❌ Named colors (`color-named: never`)
  - ❌ `rgb()`, `rgba()`, `hsl()`, `hsla()` (use modern `color()`)
  - ❌ `border: none` (use `0`)
  - ❌ `transition: all` (specify properties)
  - ❌ Data URIs and FTP schemes
  - ❌ TODO/FIXME comments in production

- **Enhanced Enforcement**:
  - Z-index must use CSS variables
  - Strict value notation for all colors, fonts, sizes
  - Modern color notation mandatory

---

## 💎 RuboCop (Ruby)

### Strictest Ruby Standards

- **Reduced Metrics** (More strict than Rails defaults):
  - Method length: **8** lines (from 10)
  - Class length: **80** lines (from 100)
  - Line length: **100** characters (from 120)
  - ABC size: **8** (from 10)
  - Cyclomatic complexity: **4** (from 5)
  - Perceived complexity: **5** (from 6)

- **50+ New Strict Rules**:
  - `Style/RedundantReturn`: No explicit returns
  - `Style/SafeNavigation`: Use `&.` operator
  - All Performance cops enabled
  - Comprehensive Lint rules
  - RSpec best practices (MessageSpies, VerifiedDoubles)

- **RSpec Strictness**:
  - Example length: **8** lines (from 10)
  - Max expectations: **2** per test
  - Max nested groups: **3**

---

## 📘 TypeScript Compiler

### Maximum Type Safety

- **All Strict Flags Enabled**:
  - `strictNullChecks`
  - `strictFunctionTypes`
  - `strictBindCallApply`
  - `strictPropertyInitialization`
  - `useUnknownInCatchVariables`

- **Additional Safety**:
  - `noUnusedLocals` / `noUnusedParameters`
  - `exactOptionalPropertyTypes`
  - `noUncheckedIndexedAccess`
  - `noPropertyAccessFromIndexSignature`
  - `allowUnusedLabels: false`
  - `allowUnreachableCode: false`

- **Target**: ES2023 (latest stable)

---

## 🎯 Prettier (Code Formatting)

- Print width: **80** characters
- Single quotes everywhere
- Trailing commas: **always**
- Arrow parens: **always**
- Single attribute per line
- Prose wrap: **always**

---

## 📊 Enforcement Reports

All linters are configured with:

- ✅ `reportUnusedDisableDirectives: error`
- ✅ `reportInvalidScopeDisables: true`
- ✅ `reportNeedlessDisables: true`
- ✅ `reportDescriptionlessDisables: true`

---

## 🚀 Running Linters

```bash
# Individual linters
npm run lint:ts      # ESLint (TypeScript/JavaScript)
npm run lint:css     # Stylelint (CSS/SCSS)
npm run lint:md      # Markdownlint
bundle exec rubocop  # RuboCop (Ruby)

# All at once
npm run lint         # Runs all linters
```

---

## 📈 Benefits

1. **Early Bug Detection**: Catch issues before they reach production
2. **Consistent Code Quality**: Enforce best practices across the team
3. **Performance**: Rules optimized for runtime performance
4. **Maintainability**: Lower cognitive load from simpler code
5. **Type Safety**: Maximum TypeScript strictness prevents runtime errors
6. **Best Practices**: Industry-leading standards enforcement

---

## ⚠️ Migration Notes

These rules are **significantly stricter** than standard configurations. When
upgrading:

1. Run linters individually to see violations
2. Fix critical issues first (type safety, security)
3. Refactor for complexity limits
4. Use `eslint-disable` sparingly and document why
5. Consider technical debt for large codebases

---

## 🔒 Pre-commit Enforcement

All linting rules are enforced via:

- Husky pre-commit hooks
- Lint-staged for changed files only
- CI/CD pipeline validation

No code with linting errors can be committed.

---

## 📚 Reference Documentation

- [ESLint Rules](https://eslint.org/docs/latest/rules/)
- [TypeScript ESLint](https://typescript-eslint.io/rules/)
- [Stylelint Rules](https://stylelint.io/user-guide/rules/)
- [RuboCop Rules](https://docs.rubocop.org/rubocop/)
- [Prettier Options](https://prettier.io/docs/en/options.html)

---

**Maintained by**: Syafiq Hadzir
**Review Frequency**: Quarterly  
**Last Audit**: 2026-01-10
