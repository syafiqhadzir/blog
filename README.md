# Syafiq Hadzir's Blog

[![CI/CD Pipeline](https://github.com/syafiqhadzir/blog/actions/workflows/jekyll.yml/badge.svg)](https://github.com/syafiqhadzir/blog/actions/workflows/jekyll.yml)
[![Ruby](https://img.shields.io/badge/Ruby-3.4.1-CC342D?logo=ruby&logoColor=white)](https://www.ruby-lang.org/)
[![Jekyll](https://img.shields.io/badge/Jekyll-4.4.1-CC0000?logo=jekyll&logoColor=white)](https://jekyllrb.com/)
[![AMP](https://img.shields.io/badge/AMP-Valid-005AF0?logo=amp&logoColor=white)](https://amp.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-45ba4b?logo=playwright&logoColor=white)](https://playwright.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Just another QA engineer who codes and writes.

## 🌐 Live Site

**[syafiqhadzir.dev/blog](https://syafiqhadzir.dev/blog)**

## ✨ Features

| Feature | Description |
|---------|-------------|
| ⚡ **AMP-First** | All pages are valid AMP for instant loading |
| 📱 **PWA** | Service worker v3 with offline support |
| ♿ **WCAG 2.1 AA** | Full accessibility compliance |
| 🧪 **77 Tests** | 58 unit (RSpec) + 19 E2E (Playwright) |
| 📖 **Reading Time** | Estimated read time per post |
| 🔗 **Related Posts** | Category-based recommendations |
| 🔒 **Security** | AI bot blocks, security.txt, weekly audits |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Ruby 3.4.1, Node.js 20 |
| Generator | Jekyll 4.4.1 |
| Framework | AMP HTML |
| Unit Tests | RSpec + HTMLProofer |
| E2E Tests | Playwright |
| CI/CD | GitHub Actions |
| Hosting | GitHub Pages + Cloudflare |

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/syafiqhadzir/blog.git
cd blog

# Install Ruby dependencies
bundle install

# Install Node dependencies (for E2E tests)
npm install
npx playwright install

# Start development server
bundle exec jekyll serve

# Run unit tests
bundle exec rake test:unit

# Run E2E tests
npm run test:e2e
```

## 📁 Project Structure

```
blog/
├── _data/           # Site data (menu.yml)
├── _includes/       # Reusable components
├── _layouts/        # Page templates
├── _posts/          # Blog posts (11 articles)
├── e2e/             # Playwright E2E tests
├── favicons/        # PWA icons (29 sizes)
├── spec/unit/       # RSpec unit tests
├── _config.yml      # Jekyll configuration
├── Gemfile          # Ruby dependencies
├── package.json     # Node.js dependencies
└── playwright.config.ts
```

## 🧪 Testing

| Level | Tool | Tests |
|-------|------|-------|
| Unit | RSpec | 58 |
| Integration | HTMLProofer | Links, images |
| E2E | Playwright | 19 |
| Lint | YAML/JSON | Config files |
| Security | bundle-audit | Weekly |

```bash
bundle exec rake test:unit    # Unit tests
npm run test:e2e              # E2E tests
```

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
- [SECURITY.md](SECURITY.md) - Security policy
- [humans.txt](humans.txt) - Team attribution

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  Made with ❤️ by <a href="https://syafiqhadzir.dev">Syafiq Hadzir</a>
</p>
