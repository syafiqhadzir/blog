# Architectural Overview

This document describes the high-level architecture of the blog, focusing on the
"Bleeding Edge" principles of performance, security, and developer experience.

## 🏛️ Design System & SCSS

The site follows a **Scoped Design System** approach to minimize the AMP CSS
limit penalty (75,000 bytes).

### 1. Variables Strategy

Global tokens are defined in `_sass/abstracts/_variables.scss` using CSS custom
properties.

- **Root Scale**: Typography, spacing, and z-index.
- **Theme Support**: Real-time dark/light mode switching using
  `@media (prefers-color-scheme: dark)`.

### 2. Selective Component Scoping

To reduce total payload, heavy third-party variable suites (like **Catppuccin**)
are scoped within their specific parent classes (e.g., `.highlight`) rather than
being defined globally in `:root`. This saves ~10-15KB of CSS per non-code page.

## ⚡ AMP & Performance

The blog is built on an **AMP-First** architecture.

- **Instant Loading**: Leverages the AMP Cache and pre-rendering.
- **Payload Guardrails**:
  - **Minification**: Every HTML file is minified post-build.
  - **Binary Watchdog**: CI fails if the total site weight exceeds 12MB.
  - **Lighthouse Enforcement**: 100% scores are required across Performance,
    Accessibility, Best Practices, and SEO.

## 🔄 CI/CD Philosophy: Build-Once-Run-Many

We use a unified GitHub Actions pipeline
([jekyll.yml](.github/workflows/jekyll.yml)) designed for maximum speed.

### 1. Unified Build Job

The site is built exactly once at the start of the pipeline. The `_site`
directory is uploaded as a production-ready artifact.

### 2. Parallel Verification

Downstream jobs (E2E, Lighthouse, Audit) download the _same_ artifact. This
ensures that what is tested is exactly what is deployed, preventing "works on my
machine" discrepancies.

### 3. Sharded E2E Testing

Playwright tests are split across multiple parallel runners using matrix
sharding, reducing E2E time from minutes to seconds.

## 🔒 Security Architecture

- **Zero-Trust Egress**: `step-security/harden-runner` monitors all outbound
  network calls during build.
- **Surgical Overrides**: Since many Jekyll plugins rely on legacy Node
  dependencies, we use `package.json` `overrides` to force the use of patched
  versions of deep-level transitive dependencies.
- **AI Blocking**: `robots.txt` explicitly disallows major AI crawlers to
  preserve content sovereignty.

---

_For more details on contributing, see [CONTRIBUTING.md](../CONTRIBUTING.md)._
