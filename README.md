# Syafiq Hadzir's Blog

[![Deploy to GitHub Pages](https://github.com/syafiqhadzir/blog/actions/workflows/jekyll.yml/badge.svg)](https://github.com/syafiqhadzir/blog/actions/workflows/jekyll.yml)
[![Ruby](https://img.shields.io/badge/Ruby-3.4.1-CC342D?logo=ruby)](https://www.ruby-lang.org/)
[![Jekyll](https://img.shields.io/badge/Jekyll-4.4.1-CC0000?logo=jekyll)](https://jekyllrb.com/)
[![AMP](https://img.shields.io/badge/AMP-Valid-005AF0?logo=amp)](https://amp.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Just another QA engineer who codes and writes.

## 🚀 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Ruby | 3.4.1 | Runtime |
| Jekyll | 4.4.1 | Static Site Generator |
| AMP | ⚡ | Accelerated Mobile Pages |
| GitHub Pages | - | Hosting |

## ✨ Features

- **AMP-First** - All pages are valid AMP for fast mobile performance
- **PWA Ready** - Service worker for offline support
- **WCAG 2.1 AA** - Full accessibility compliance
- **Pyramid Testing** - 58 unit tests with RSpec

## 🧪 Testing

```powershell
# Install dependencies
bundle install

# Run unit tests
bundle exec rake test:unit

# Build site
bundle exec jekyll build

# Serve locally
bundle exec jekyll serve
```

## 📁 Project Structure

```
├── _data/          # Site data (menu.yml)
├── _includes/      # Reusable components
├── _layouts/       # Page templates
├── _posts/         # Blog posts (Markdown)
├── spec/           # RSpec test suite
│   └── unit/       # Unit tests (58 specs)
├── _config.yml     # Jekyll configuration
├── Gemfile         # Ruby dependencies
└── Rakefile        # Build & test tasks
```

## ♿ Accessibility

- Skip-to-content navigation
- ARIA landmark roles
- Visible focus indicators
- Semantic HTML structure
- Screen reader support

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
