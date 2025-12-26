# Contributing to Syafiq Hadzir's Blog

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Development Setup

### Prerequisites

- Ruby >= 3.4.0
- Node.js >= 22.0.0
- Bundler
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/syafiqhadzir/blog.git
cd blog

# Install Ruby dependencies
bundle install

# Install Node dependencies
npm install

# Install Playwright browsers (for E2E tests)
npx playwright install
```

### Running Locally

```bash
# Start development server
bundle exec jekyll serve --livereload

# Or use Rake
bundle exec rake serve
```

## Code Style

### Ruby

- Follow RuboCop rules (`.rubocop.yml`)
- Use frozen string literals
- Max line length: 120 characters

### TypeScript/JavaScript

- Follow ESLint rules (`eslint.config.js`)
- Use Prettier for formatting
- Prefer single quotes

### Markdown

- Follow markdownlint rules (`.markdownlint.json`)

## Testing

### Running Tests

```bash
# Unit tests (RSpec)
bundle exec rake test:unit

# E2E tests (Playwright)
npm run test:e2e

# All linters
npm run lint
bundle exec rubocop

# Full test suite
bundle exec rake test:all
```

### Test Requirements

- All PRs must pass existing tests
- New features should include appropriate tests
- E2E tests for UI changes

## Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes following [Conventional Commits](https://www.conventionalcommits.org/)
4. **Push** to your branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Commit Message Format

```text
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### PR Checklist

- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated if needed
- [ ] No new linting warnings

## Reporting Issues

Use the [Bug Report](https://github.com/syafiqhadzir/blog/issues/new?template=bug_report.yml) template for bugs.

Use the [Feature Request](https://github.com/syafiqhadzir/blog/issues/new?template=feature_request.yml) template for enhancements.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
