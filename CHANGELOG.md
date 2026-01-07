<!-- markdownlint-disable-file MD024 -->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Expert-level Google Analytics 4 (GA4) implementation** (#analytics-v2)
  - 15 tracked events covering all user interactions
  - 14 event-scoped custom dimensions for granular attribution
  - 1 user-scoped custom dimension for audience segmentation
  - 5 recommended conversion events
  - Comprehensive event tracking:
    - Content performance (page views, reading time, scroll depth)
    - User engagement (active time, article completion, theme preferences)
    - Navigation patterns (internal/external links, navigation clicks,
      back-to-top)
    - Content discovery (tag clicks, search queries, related posts)
    - Social sharing and file downloads
    - Error monitoring (404 tracking)
  - AMP-optimized with <0.1s performance impact
  - GDPR/CCPA consent mode ready
  - Cross-domain tracking configuration
  - Debug mode support for testing
- GA4 documentation suite:
  - `docs/GA4_DOCUMENTATION.md` - Complete documentation suite
  - `scripts/validate-ga4.js` - Automated validation script
  - `npm run validate:ga4` - New script to validate analytics configuration

### Changed

- **Analytics configuration refactored** from basic to enterprise-grade
  - Removed problematic `groups` parameter that can cause GA4 issues
  - Simplified pageview configuration to use trigger-based approach
  - Enhanced custom dimension structure for better data attribution
  - Separated scroll depth triggers for more accurate engagement analysis
  - Distinguished outbound vs. internal link tracking
  - Added reading time calculation for content performance analysis
- Updated README.md with Analytics section showcasing capabilities

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
