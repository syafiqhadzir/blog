# Lighthouse CI Configuration Guide

Comprehensive guide to the Lighthouse CI setup with budgets, custom audits, and
user flows.

## Overview

This project uses an advanced Lighthouse CI configuration with:

- **Performance budgets** for resources and timings
- **7 pages tested** (up from 4)
- **Custom AMP validation** audit
- **User flow testing** for critical paths
- **Environment-specific configs** (CI vs local)
- **Enhanced accessibility** audits

## Quick Start

### Local Development

```bash
# Run with relaxed thresholds (single run, faster)
npm run lighthouse:local

# Run user flows
npm run lighthouse:flows

# Check budgets only
npm run lighthouse:budget
```

### CI Environment

```bash
# Run with strict thresholds (5 runs)
npm run lighthouse:ci
```

## Configuration Files

### `budget.json`

Performance budgets for:

- **Timing budgets**: FCP, LCP, TTI, TBT, CLS, SI
- **Resource budgets**: Scripts (300KB), CSS (50KB), Images (500KB), Fonts
  (100KB)
- **Resource counts**: Max scripts, stylesheets, images, fonts

### `lighthouserc.cjs` (Main)

- 7 pages tested (index, about, archive, tags, accessibility, 404, latest post)
- Organized assertions by category (accessibility, performance, SEO, best
  practices)
- 3 runs for statistical accuracy
- Mobile-first testing

### `lighthouserc.ci.cjs` (CI)

- Stricter thresholds (LCP: 2600ms, DOM: 2100)
- 5 runs for better accuracy
- Uploads to temporary storage

### `lighthouserc.local.cjs` (Local)

- Relaxed thresholds (LCP: 3000ms, DOM: 2500)
- Single run for speed
- No uploads

## Custom Audits

### AMP Validation (`lighthouse/custom-audits/amp-validation.js`)

Validates AMP pages beyond standard checks:

- Verifies AMP runtime presence
- Checks component usage
- Warns on excessive components (>20)

## User Flows

### Critical Paths (`lighthouse/flows/critical-paths.js`)

Tests 3 critical user journeys:

1. **Homepage → Archive → Post**
2. **Homepage → Tags → Tag → Post**
3. **Search Functionality**

Run with: `npm run lighthouse:flows`

Reports saved to: `./lighthouse/reports/`

## Assertions

### Accessibility (Zero Tolerance)

All ARIA, focus, and semantic HTML audits set to `error`.

### Performance (Strict AMP Thresholds)

- **LCP**: ≤2.7s (CI), ≤3.0s (local)
- **FCP**: ≤1.8s
- **TTI**: ≤3.8s
- **TBT**: ≤200ms
- **CLS**: ≤0.1

### SEO & Best Practices

Perfect scores required (100%).

## Troubleshooting

### Windows Permission Errors

If you encounter `EPERM` errors on Windows:

- This is a known Chrome Launcher issue
- Use WSL or run in CI (Linux)
- Or manually clean temp directory

### Budget Violations

Check `budget.json` and adjust as needed:

- Increase resource budgets if legitimate
- Optimize assets if violations are real

### Failed Assertions

1. Check `.lighthouseci/` directory for detailed reports
2. Review specific audit failures
3. Adjust thresholds in environment-specific configs if needed

## Scripts Reference

| Script                       | Description                 |
| ---------------------------- | --------------------------- |
| `npm run lighthouse`         | Run default config (3 runs) |
| `npm run lighthouse:local`   | Local dev (1 run, relaxed)  |
| `npm run lighthouse:ci`      | CI (5 runs, strict)         |
| `npm run lighthouse:flows`   | User flow tests             |
| `npm run lighthouse:budget`  | Budget check only           |
| `npm run lighthouse:collect` | Collect data only           |

## GitHub Actions

Workflow: `.github/workflows/lighthouse-ci.yml`

- Runs on PR and main branch pushes
- Comments PR with scores
- Uploads reports as artifacts (30 days retention)

## Best Practices

1. **Always test locally** before pushing
2. **Review budget violations** carefully
3. **Update budgets** when adding legitimate features
4. **Check user flows** after major UI changes
5. **Monitor trends** over time

## Resources

- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [Performance Budgets](https://web.dev/performance-budgets-101/)
- [AMP Validation](https://amp.dev/documentation/guides-and-tutorials/learn/validation-workflow/)
- [User Flows](https://github.com/GoogleChrome/lighthouse/blob/main/docs/user-flows.md)
