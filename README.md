# Syafiq Hadzir's Blog

[![CI/CD Pipeline](https://github.com/syafiqhadzir/blog/actions/workflows/jekyll.yml/badge.svg)](https://github.com/syafiqhadzir/blog/actions/workflows/jekyll.yml)
[![Ruby](https://img.shields.io/badge/Ruby-3.4.1-CC342D?logo=ruby&logoColor=white)](https://www.ruby-lang.org/)
[![Jekyll](https://img.shields.io/badge/Jekyll-4.4.1-CC0000?logo=jekyll&logoColor=white)](https://jekyllrb.com/)
[![AMP](https://img.shields.io/badge/AMP-Valid-005AF0?logo=amp&logoColor=white)](https://amp.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Just another QA engineer who codes and writes.

## 🌐 Live Site

**[syafiqhadzir.dev/blog](https://syafiqhadzir.dev/blog)**

## ✨ Features

| Feature | Description |
|---------|-------------|
| ⚡ **AMP-First** | All pages are valid AMP for instant loading |
| 📱 **PWA** | Service worker for offline support |
| ♿ **WCAG 2.1 AA** | Full accessibility compliance |
| 🧪 **58 Unit Tests** | RSpec pyramid testing |
| 📖 **Reading Time** | Estimated read time per post |
| 🔗 **Related Posts** | Category-based recommendations |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Ruby 3.4.1 |
| Generator | Jekyll 4.4.1 |
| Framework | AMP HTML |
| Testing | RSpec + HTMLProofer |
| CI/CD | GitHub Actions |
| Hosting | GitHub Pages + Cloudflare |

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/syafiqhadzir/blog.git
cd blog

# Install dependencies
bundle install

# Start development server
bundle exec jekyll serve

# Run tests
bundle exec rake test:unit
```

## 📁 Project Structure

```
blog/
├── _data/           # Site data (menu.yml)
├── _includes/       # Reusable components
├── _layouts/        # Page templates
├── _posts/          # Blog posts (Markdown)
├── spec/unit/       # RSpec unit tests
├── _config.yml      # Jekyll configuration
├── Gemfile          # Ruby dependencies
└── Rakefile         # Build & test tasks
```

## 🧪 Testing

| Level | Tool | Coverage |
|-------|------|----------|
| Unit | RSpec | 58 specs |
| Integration | HTMLProofer | Links, images |
| Lint | YAML validation | Config files |

```bash
bundle exec rake test:unit        # Run unit tests
bundle exec rake test             # Run all tests
```

## ♿ Accessibility

- Skip-to-content navigation
- ARIA landmark roles (banner, navigation, main, contentinfo)
- Visible focus indicators (2px outline)
- Semantic HTML (`<article>`, `<nav>`, `<time>`)
- Screen reader support (`.sr-only`)

## 🔒 Security

Found a vulnerability? See [SECURITY.md](SECURITY.md) for reporting guidelines.

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  Made with ❤️ by <a href="https://syafiqhadzir.dev">Syafiq Hadzir</a>
</p>
