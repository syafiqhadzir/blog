# Syafiq Hadzir's Blog

[![CI/CD Pipeline](https://github.com/syafiqhadzir/blog/actions/workflows/jekyll.yml/badge.svg)](https://github.com/syafiqhadzir/blog/actions/workflows/jekyll.yml)
[![Ruby](https://img.shields.io/badge/Ruby-3.4.1-CC342D?logo=ruby&logoColor=white)](https://www.ruby-lang.org/)
[![Jekyll](https://img.shields.io/badge/Jekyll-4.4.1-CC0000?logo=jekyll&logoColor=white)](https://jekyllrb.com/)
[![AMP](https://img.shields.io/badge/AMP-Valid-005AF0?logo=amp&logoColor=white)](https://amp.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-45ba4b?logo=playwright&logoColor=white)](https://playwright.dev/)
[![Security](https://img.shields.io/badge/Security-Harden-success?logo=github-actions&logoColor=white)](https://github.com/step-security/harden-runner)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Just another QA engineer who codes and writes.

## 🌐 Live Site

**[blog.syafiqhadzir.dev](https://blog.syafiqhadzir.dev)** •
[Sitemap](https://blog.syafiqhadzir.dev/sitemap.xml) •
[RSS Feed](https://blog.syafiqhadzir.dev/feed.xml)

## ✨ Features

| Feature              | Description                                         |
| -------------------- | --------------------------------------------------- |
| ⚡ **AMP-First**     | All pages are valid AMP for instant loading         |
| 📱 **PWA**           | Service worker v4 (Workbox 7) with offline support  |
| ♿ **WCAG 2.1 AA**   | Full accessibility compliance                       |
| 🧪 **250+ Tests**    | 68 quality specs + 170+ HTMLProofer checks + E2E    |
| 📖 **Reading Time**  | Estimated read time per post                        |
| 🔗 **Related Posts** | Category-based recommendations                      |
| 🔒 **Security**      | Zero-vulnerability audits, AI bot blocks, RFC 9116  |
| 🚀 **Bleeding Edge** | Unified CI/CD with payload-profiling & minification |

## 🛠️ Tech Stack

| Layer       | Technology                                     |
| ----------- | ---------------------------------------------- |
| Runtime     | Ruby 3.4.1, Node.js 24                         |
| Generator   | Jekyll 4.4.1                                   |
| Framework   | AMP HTML                                       |
| Linters     | ESLint 9 (Strict), Stylelint (Strict), RuboCop |
| E2E Tests   | Playwright (Sharded)                           |
| CI/CD       | GitHub Actions (Unified Pipeline)              |
| Performance | Lighthouse CI (100% Targets)                   |

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
├── e2e/               # Playwright E2E tests
├── scripts/           # Automation (Verify, Minify, Tag Management)
├── spec/              # Quality and correctness specs
└── _config.yml        # Jekyll configuration
```

## 🧪 Testing & Quality

We maintain 100% scores in Lighthouse and 0 violations across all linters.

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
- [scripts/README.md](scripts/README.md) - Automation script documentation
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development guidelines

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<!-- markdownlint-disable-next-line MD033 -->
<p align="center">
  <!-- markdownlint-disable-next-line MD033 -->
  Made with ❤️ by <a href="https://syafiqhadzir.dev">Syafiq Hadzir</a>
</p>
