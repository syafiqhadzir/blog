# E2E Testing Strategy

This repository uses **Playwright** for high-performance End-to-End testing.

## Strategy

1. **PR Fast Lane**: Sub-minute "Smoke" tests.
   - Blocks ads, analytics, fonts, and animations.
   - Runs in parallel.
   - Checks core critical paths only.
   
2. **Nightly Full Coverage**:
   - Visits **100% of generated HTML pages**.
   - Validates all internal links.
   - Checks SEO/Metadata.
   - Collects performance metrics.

## Commands

| Purpose | Command | Description |
| :--- | :--- | :--- |
| **Quick Check** | `npm run test:fast` | Used in PRs. Fast, headless, heavily blocked. |
| **Full Suite** | `npm run test:full` | Used Nightly. Exhaustive coverage. |
| **Debug** | `npm run test:e2e:headed` | Runs visually with inspector. |
| **Perf Audit** | `npm run test:all` | Runs everything. |

## Configuration

Control behavior via Environment Variables:
- `PERF_MODE=true`: Enables resource blocking (ads/fonts).
- `CHECK_EXTERNAL=true`: Validates external links (slow).
- `BASE_URL`: Target server (default: `http://127.0.0.1:5000`).

## CI/CD (GitHub Actions)

- **PR Workflow**: Runs `npm run test:fast`. Failures block merge.
- **Nightly Workflow**: Runs `npm run test:full` on Chromium, Firefox, WebKit. Artifacts uploaded on failure.

## Troubleshooting

- **Server Start**: Note that `npm run test:*` commands invoke `http-server` via Playwright's `webServer` config.
- **Build**: The site is rebuilt (`bundle exec jekyll build`) automatically before tests start suitable for `CI`.
