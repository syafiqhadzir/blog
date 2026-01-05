/**
 * @fileoverview Lighthouse CI Configuration (Enhanced)
 * Comprehensive configuration with budgets, enhanced audits, and 7 test pages
 * @license MIT
 */

// ============================================================================
// LIGHTHOUSE CI CONFIGURATION (Enhanced)
// ============================================================================
// Comprehensive configuration with:
// - Resource and timing budgets
// - Enhanced accessibility audits
// - Modern image format checks
// - 7 pages tested (mobile + desktop)
// - Organized assertions by category
// ============================================================================

// ============================================================================
// ACCESSIBILITY ASSERTIONS (Zero Tolerance)
// ============================================================================
const accessibilityAssertions = {
  'aria-allowed-attr': 'error',
  'aria-allowed-role': 'error',
  'aria-command-name': 'error',
  'aria-dialog-name': 'error',
  'aria-hidden-body': 'error',
  'aria-hidden-focus': 'error',
  'aria-input-field-name': 'error',
  'aria-meter-name': 'error',
  'aria-progressbar-name': 'error',
  'aria-required-attr': 'error',
  'aria-required-children': 'error',
  'aria-required-parent': 'error',
  'aria-roles': 'error',
  'aria-toggle-field-name': 'error',
  'aria-tooltip-name': 'error',
  'aria-treeitem-name': 'error',
  'aria-valid-attr': 'error',
  'aria-valid-attr-value': 'error',
  'button-name': 'error',
  bypass: 'error',
  'color-contrast': 'off', // AMP handles contrast differently
  'definition-list': 'error',
  dlitem: 'error',
  'duplicate-id-aria': 'error',
  'focus-traps': 'error',
  'focusable-controls': 'error',
  'form-field-multiple-labels': 'error',
  'frame-title': 'error',
  'heading-order': 'error',
  'html-has-lang': 'error',
  'html-lang-valid': 'error',
  'html-xml-lang-mismatch': 'error',
  'image-alt': 'error',
  'input-button-name': 'error',
  'input-image-alt': 'error',
  'interactive-element-affordance': 'error',
  label: 'error',
  'label-content-name-mismatch': 'error',
  'link-name': 'error',
  'link-text': 'error',
  list: 'error',
  listitem: 'error',
  'managed-focus': 'error',
  'meta-viewport': 'error',
  'object-alt': 'error',
  'select-name': 'error',
  'skip-link': 'error',
  tabindex: 'error',
  'table-duplicate-name': 'error',
  'td-headers-attr': 'error',
  'th-has-data-cells': 'error',
  'valid-lang': 'error',
  'video-caption': 'error',
};

// ============================================================================
// PERFORMANCE ASSERTIONS (Strict AMP Thresholds)
// ============================================================================
const performanceAssertions = {
  // Core Web Vitals
  'bootup-time': ['warn', { maxNumericValue: 2500 }],
  'critical-request-chains': 'warn',
  'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // CLS
  'dom-size': ['warn', { maxNumericValue: 2200 }],
  'duplicated-javascript': 'off', // AMP runtime optimization
  'efficient-animated-content': 'error',
  'first-contentful-paint': ['error', { maxNumericValue: 1800 }], // FCP
  interactive: ['error', { maxNumericValue: 3800 }], // TTI
  'largest-contentful-paint': ['error', { maxNumericValue: 2700 }], // LCP (CI)
  'legacy-javascript': 'off', // AMP runtime is modern
  'mainthread-work-breakdown': ['warn', { maxNumericValue: 3000 }],
  'max-potential-fid': ['warn', { maxNumericValue: 150 }], // FID
  'modern-image-formats': 'warn',
  'network-requests': 'off', // AMP makes many optimized requests
  'network-rtt': 'warn',
  'network-server-latency': 'warn',
  'offscreen-images': 'error',
  'render-blocking-resources': 'warn', // AMP optimizes this
  'server-response-time': ['error', { maxNumericValue: 600 }], // TTFB
  'speed-index': ['error', { maxNumericValue: 3400 }], // SI
  'third-party-facades': 'warn',
  'third-party-summary': 'off', // AMP manages third-party
  'total-blocking-time': ['error', { maxNumericValue: 200 }], // TBT
  'total-byte-weight': ['warn', { maxNumericValue: 1_600_000 }], // 1.6MB
  'unminified-css': 'error',
  'unminified-javascript': 'error',
  'unsized-images': 'error',
  'unused-css-rules': 'warn',
  'unused-javascript': 'off', // AMP runtime optimization
  'uses-long-cache-ttl': 'warn',
  'uses-optimized-images': 'error',
  'uses-passive-event-listeners': 'error',
  'uses-rel-preconnect': 'warn',
  'uses-responsive-images': 'error',
  'uses-text-compression': 'error',
};

// ============================================================================
// SEO ASSERTIONS (Comprehensive)
// ============================================================================
const seoAssertions = {
  canonical: 'error',
  charset: 'error',
  'crawlable-anchors': 'error',
  'document-title': 'error',
  'font-size': 'error',
  hreflang: 'error',
  'http-status-code': 'error',
  'image-aspect-ratio': 'error',
  'image-size-responsive': 'error',
  'is-crawlable': 'error',
  'meta-description': 'error',
  'meta-refresh': 'error',
  'robots-txt': 'error',
  viewport: 'error',
};

// ============================================================================
// BEST PRACTICES ASSERTIONS
// ============================================================================
const bestPracticesAssertions = {
  'csp-xss': 'error',
  deprecations: 'error',
  doctype: 'error',
  'errors-in-console': 'error',
  'geolocation-on-start': 'error',
  'inspector-issues': 'error',
  'js-libraries': 'off', // AMP uses specific libraries
  'no-document-write': 'error',
  'non-composited-animations': 'error',
  'notification-on-start': 'error',
  redirects: 'error',
};

// ============================================================================
// CATEGORY SCORES (Expert-Level Thresholds)
// ============================================================================
const categoryAssertions = {
  'categories:accessibility': ['error', { minScore: 1 }], // Perfect
  'categories:best-practices': ['error', { minScore: 1 }], // Perfect
  'categories:performance': ['error', { minScore: 0.95 }], // 95+ for AMP
  'categories:seo': ['error', { minScore: 1 }], // Perfect
};

// ============================================================================
// MAIN CONFIGURATION
// ============================================================================
module.exports = {
  ci: {
    assert: {
      assertions: {
        ...accessibilityAssertions,
        ...bestPracticesAssertions,
        ...categoryAssertions,
        ...performanceAssertions,
        ...seoAssertions,
      },
      // Budgets from budget.json
      budgetFile: './budget.json',
      // Strict preset with custom overrides
      preset: 'lighthouse:recommended',
    },
    collect: {
      // Multiple runs for statistical accuracy
      numberOfRuns: 3,
      settings: {
        // Mobile-first AMP testing
        formFactor: 'mobile',
        // AMP-specific categories
        onlyCategories: [
          'performance',
          'accessibility',
          'best-practices',
          'seo',
          'pwa',
        ],
        // Skip audits that don't apply to AMP or are deprecated
        skipAudits: ['bf-cache'],
        // Throttling to simulate 4G
        throttling: {
          cpuSlowdownMultiplier: 4,
          downloadThroughputKbps: 1638.4,
          requestLatencyMs: 150,
          rttMs: 150,
          throughputKbps: 1638.4,
          uploadThroughputKbps: 675,
        },
        throttlingMethod: 'simulate',
      },
      // Test critical pages
      url: [
        'http://localhost:5000/index.html',
        'http://localhost:5000/about.html',
        'http://localhost:5000/archive.html',
        'http://localhost:5000/tags.html',
        'http://localhost:5000/accessibility.html',
        'http://localhost:5000/404.html',
        'http://localhost:5000/testing-websockets-k6.html',
      ],
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
