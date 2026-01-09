# Syafiq Hadzir's Blog

[![CI/CD Pipeline][ci-badge]][ci-link] [![Ruby][ruby-badge]][ruby-link]
[![Jekyll][jekyll-badge]][jekyll-link] [![AMP][amp-badge]][amp-link]
[![Playwright][playwright-badge]][playwright-link]
[![Security][security-badge]][security-link]
[![License: MIT][license-badge]][license-link]

> Just another QA engineer who codes and writes.

## 🌐 Live Site

**[blog.syafiqhadzir.dev](https://blog.syafiqhadzir.dev)** •
[Sitemap](https://blog.syafiqhadzir.dev/sitemap.xml) •
[RSS Feed](https://blog.syafiqhadzir.dev/feed.xml)

## ✨ Features

<!-- markdownlint-disable MD060 -->

| Feature              | Description                                           |
| -------------------- | ----------------------------------------------------- |
| ⚡ **AMP-First**     | All pages are valid AMP for instant loading           |
| 📱 **PWA**           | Service worker (Workbox) with robust offline fallback |
| ♿ **WCAG 2.1 AA**   | Full accessibility compliance                         |
| 🧪 **250+ Tests**    | 68 quality specs + 170+ HTMLProofer checks + E2E      |
| 📖 **Reading Time**  | Estimated read time per post                          |
| 🔗 **Related Posts** | Category-based recommendations                        |
| 🔒 **Security**      | Zero-vulnerability audits, AI bot blocks, RFC 9116    |
| 🚀 **Bleeding Edge** | Unified CI/CD, Strict Linting (Zero Silencers)        |

## 🛠️ Tech Stack

| Layer       | Technology                                   |
| ----------- | -------------------------------------------- |
| Runtime     | Ruby >= 3.4.0, Node.js 24                    |
| Generator   | Jekyll 4.4.1                                 |
| Framework   | AMP HTML                                     |
| Linters     | ESLint 9, Stylelint, RuboCop (Bleeding Edge) |
| E2E Tests   | Playwright (Sharded)                         |
| CI/CD       | GitHub Actions (Unified Pipeline)            |
| Performance | Lighthouse CI (100% Targets)                 |

## 🚀 Quick Start

```powershell
# Clone repository
git clone https://github.com/syafiqhadzir/blog.git
cd blog

# Local CI Simulation (Bleeding Edge tool)
# Runs Lint, Audit, Build, Minify, and Profile in one command
./scripts/verify.ps1

# Traditional Start
bundle install
npm install
npx playwright install
bundle exec jekyll serve
```

## 📁 Project Structure

```text
blog/
├── .github/workflows/ # Unified CI/CD Pipeline
├── _data/             # Site data (menu.yml)
├── _includes/         # Reusable components
├── _layouts/          # Page templates
├── _posts/            # Blog posts (170+ articles)
├── _sass/             # Design system (Variables, Scoped Components)
├── assets/            # Static assets (images, scripts, SW helpers)
├── e2e/               # Playwright E2E tests
├── scripts/           # Automation (Verify, Minify, Tag Management)
├── spec/              # Quality and correctness specs
└── _config.yml        # Jekyll configuration
```

## 🧪 Testing & Quality

We maintain **100% scores** in Lighthouse and **0 violations** across all
linters (ESLint, Stylelint, RuboCop).

| Level           | Tool        | Strategy                                             |
| --------------- | ----------- | ---------------------------------------------------- |
| **Quality**     | RSpec       | Structural integrity & data validation               |
| **Integrity**   | HTMLProofer | Broken links, image alt, HTTPS enforcement           |
| **Performance** | Lighthouse  | Automated audits (Perf/A11y/SEO/Best Practice)       |
| **Security**    | Audit       | Surgical dependency overrides for zero-vulnerability |
| **E2E**         | Playwright  | Multi-device sharded browser verification            |

## 🔍 Schema.org

All pages include rich structured data:

- **WebSite** with SearchAction (home)
- **ProfilePage** with Person (about)
- **BlogPosting** with BreadcrumbList (posts)
- **CollectionPage** with ItemList (archive)

## ♿ Accessibility

- Skip-to-content navigation
- ARIA landmark roles
- Visible focus indicators (2px outline)
- Semantic HTML structure
- Screen reader support (`.sr-only`)

## 🔒 Security

- `robots.txt` with AI bot blocks
- `security.txt` (RFC 9116)
- Weekly automated security audits
- See [SECURITY.md](SECURITY.md) for reporting

## 📝 Documentation

- [CHANGELOG.md](CHANGELOG.md) - Version history
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Architectural deep-dive
- [docs/GA4_DOCUMENTATION.md](docs/GA4_DOCUMENTATION.md) - GA4 documentation
- [scripts/README.md](scripts/README.md) - Automation script documentation
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development guidelines

## 📊 Analytics

This blog uses **expert-level Google Analytics 4** implementation with:

- 🎯 **15 tracked events** - Comprehensive user behavior analysis
- 📊 **14 custom dimensions** - Granular content attribution
- 🎨 **5 conversion events** - Key engagement milestones
- ⚡ **AMP-optimized** - <0.1s performance impact
- 🔒 **Privacy-ready** - GDPR/CCPA consent mode support

Key tracking capabilities:

- Content performance & engagement metrics
- Scroll depth & reading time analysis
- Search behavior & tag interaction
- Social sharing & content discovery
- Internal vs. outbound link patterns
- 404 error monitoring & user preferences

See [GA4 Documentation](docs/GA4_DOCUMENTATION.md) for implementation details.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<!-- markdownlint-disable-next-line MD033 -->
<p align="center">
  <!-- markdownlint-disable-next-line MD033 -->
  Made with ❤️ by <a href="https://syafiqhadzir.dev">Syafiq Hadzir</a>
</p>

<!-- Links -->

[ci-badge]:
  https://github.com/syafiqhadzir/blog/actions/workflows/jekyll.yml/badge.svg
[ci-link]: https://github.com/syafiqhadzir/blog/actions/workflows/jekyll.yml
[ruby-badge]:
  https://img.shields.io/badge/Ruby-%3E%3D3.4.0-CC342D?logo=ruby&logoColor=white
[ruby-link]: https://www.ruby-lang.org/
[jekyll-badge]:
  https://img.shields.io/badge/Jekyll-4.4.1-CC0000?logo=jekyll&logoColor=white
[jekyll-link]: https://jekyllrb.com/
[amp-badge]:
  https://img.shields.io/badge/AMP-Valid-005AF0?logo=amp&logoColor=white
[amp-link]: https://amp.dev/
[playwright-badge]:
  https://img.shields.io/badge/Playwright-E2E-45ba4b?logo=playwright&logoColor=white
[playwright-link]: https://playwright.dev/
[security-badge]:
  https://img.shields.io/badge/Security-Harden-success?logo=github-actions&logoColor=white
[security-link]: https://github.com/step-security/harden-runner
[license-badge]: https://img.shields.io/badge/License-MIT-yellow.svg
[license-link]: LICENSE
