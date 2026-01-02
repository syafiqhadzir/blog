# Automation Scripts

This directory contains specialized automation scripts designed to maintain the "Bleeding Edge" quality and performance
standards of the blog.

## 🛠️ Main Scripts

### 1. `verify.ps1` (Local CI Simulation)

The primary tool for local development. It mirrors the GitHub Actions pipeline with high fidelity.

- **Usage**: `./scripts/verify.ps1`
- **Features**:
  - **Dependency Check**: Validates NPM and Ruby environments.
  - **Security Audit**: Runs `npm audit` and `bundle-audit`.
  - **Quality Suite**: Executes ESLint, Markdownlint, Stylelint, and RSpec in parallel.
  - **Optimized Build**: Builds Jekyll with production flags.
  - **Post-Processing**: Runs image optimization and HTML minification.
  - **Payload profiling**: Fails if the build exceeds the defined threshold (12MB).

### 2. `minify.js` (AMP-Focused HTML Minifier)

A high-performance HTML minifier optimized for AMP compliance.

- **Usage**: `node scripts/minify.js`
- **Technical Stack**: Node.js, `html-minifier-terser`, `glob`.
- **Optimization Strategy**:
  - Collapses whitespace and removes comments.
  - Minifies inlined CSS and JS.
  - Triggers automatically during the `build` phase.

### 3. `tag_manager.rb` (Metadata Standardizer)

Automates the normalization of tags and front matter across 170+ articles.

- **Usage**: `ruby scripts/tag_manager.rb`
- **Features**:
  - **Synonym Mapping**: Maps legacy tags (e.g., `a11y` -> `accessibility`).
  - **Canonical Enforcement**: Ensures only white-listed tags are used in the final build.
  - **Slug Extraction**: Derives semantic tags from the URL slug if missing.

## ⚙️ Environment Requirements

- **Runtime**: Node.js 24+, Ruby 3.4.1+.
- **Shell**: PowerShell 7+ (for `verify.ps1`) or Bash.

---

*Note: Always run `verify.ps1` before pushing to ensure zero-regression.*
