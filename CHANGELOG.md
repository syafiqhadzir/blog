<!-- markdownlint-disable-file MD024 -->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2025-12-22

### Added

- Full WCAG 2.1 AA accessibility compliance
  - Skip-to-content navigation link
  - ARIA landmark roles (banner, navigation, main, contentinfo)
  - Visible focus indicators
  - Screen reader support (.sr-only class)
- Pyramid testing infrastructure
  - 58 RSpec unit tests
  - HTMLProofer integration tests
  - Automated test gate in CI pipeline
- Security documentation
  - security.txt (RFC 9116)
  - SECURITY.md vulnerability reporting policy
- CHANGELOG.md following Keep a Changelog format

### Changed

- Upgraded Ruby from 3.3.6 to 3.4.1
- Upgraded GitHub Actions checkout from v4 to v6
- Updated CI workflow: test → build → deploy pipeline
- Enhanced semantic HTML structure in all layouts

### Removed

- Obsolete .eslintrc and .eslintignore (unused Nuxt config)

### Security

- Added fiddle gem for Ruby 3.5+ compatibility
- Added faraday-retry for clean API handling

## [1.0.0] - 2022-12-23

### Added

- Initial Jekyll blog setup
- AMP-first design
- PWA support with service worker
- 11 blog posts on QA engineering topics
