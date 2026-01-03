module.exports = {
  ci: {
    assert: {
      assertions: {
        // ============================================================
        // BEST PRACTICES
        // ============================================================
        'appcache-manifest': 'error',
        // ============================================================
        // ACCESSIBILITY (Zero Tolerance)
        // ============================================================
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
        // ============================================================
        // PERFORMANCE OPTIMIZATIONS
        // ============================================================
        'bootup-time': ['warn', { maxNumericValue: 2500 }],
        'button-name': 'error',
        bypass: 'error',
        // ============================================================
        // SEO (Comprehensive)
        // ============================================================
        canonical: 'error',
        // ============================================================
        // CATEGORY SCORES (Expert-Level Thresholds)
        // ============================================================
        'categories:accessibility': ['error', { minScore: 1 }], // Perfect accessibility
        'categories:best-practices': ['error', { minScore: 1 }], // Perfect best practices
        'categories:performance': ['error', { minScore: 0.95 }], // 95+ for AMP
        'categories:seo': ['error', { minScore: 1 }], // Perfect SEO
        charset: 'error',
        'color-contrast': 'off', // AMP handles contrast differently
        'crawlable-anchors': 'error',
        'critical-request-chains': 'warn',
        'csp-xss': 'error',
        // CLS: Cumulative Layout Shift (Good: <0.1)
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'definition-list': 'error',
        deprecations: 'error',
        dlitem: 'error',
        doctype: 'error',
        'document-title': 'error',
        'dom-size': ['warn', { maxNumericValue: 1500 }], // AMP recommendation
        'duplicate-id-active': 'error',
        'duplicate-id-aria': 'error',
        'duplicated-javascript': 'off', // AMP runtime may duplicate
        'efficient-animated-content': 'error',
        'errors-in-console': 'error',
        // FCP: First Contentful Paint (Good: <1.8s)
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'font-size': 'error',
        'form-field-multiple-labels': 'error',
        'frame-title': 'error',
        'geolocation-on-start': 'error',
        'heading-order': 'error',
        hreflang: 'error',
        'html-has-lang': 'error',
        'html-lang-valid': 'error',
        'html-xml-lang-mismatch': 'error',
        'http-status-code': 'error',
        'image-alt': 'error',
        'image-aspect-ratio': 'error',
        'image-size-responsive': 'error',
        'input-button-name': 'error',
        'input-image-alt': 'error',
        'inspector-issues': 'error',
        // ============================================================
        // PWA (Service Worker)
        // ============================================================
        'installable-manifest': 'warn',

        // ============================================================
        // PERFORMANCE BUDGETS
        // ============================================================
        // Time to Interactive (Good: <3.8s)
        interactive: ['error', { maxNumericValue: 3800 }],
        'is-crawlable': 'error',
        'js-libraries': 'off', // AMP uses specific libraries
        label: 'error',
        'label-content-name-mismatch': 'error',
        // ============================================================
        // CORE WEB VITALS (Strict AMP Thresholds)
        // ============================================================
        // LCP: Largest Contentful Paint (Good: <2.5s)
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'legacy-javascript': 'off', // AMP runtime is modern
        'link-name': 'error',
        'link-text': 'error',
        list: 'error',
        listitem: 'error',
        'mainthread-work-breakdown': ['warn', { maxNumericValue: 3000 }],
        // Max Potential FID (Good: <100ms)
        'max-potential-fid': ['error', { maxNumericValue: 100 }],

        'meta-description': 'error',
        'meta-refresh': 'error',
        'meta-viewport': 'error',
        'network-requests': 'off', // AMP makes many optimized requests
        'network-rtt': 'warn',
        'network-server-latency': 'warn',
        'no-document-write': 'error',
        'no-vulnerable-libraries': 'error',
        'non-composited-animations': 'error',
        'notification-on-start': 'error',
        'object-alt': 'error',
        'offscreen-images': 'error',
        // eslint-disable-next-line sonarjs/no-hardcoded-passwords
        'password-inputs-can-be-pasted-into': 'error',
        'paste-preventing-inputs': 'error',
        plugins: 'error',
        redirects: 'error',
        'render-blocking-resources': 'warn', // AMP optimizes this
        'robots-txt': 'error',

        'select-name': 'error',
        'server-response-time': ['error', { maxNumericValue: 600 }], // TTFB <600ms
        'service-worker': 'warn',
        'skip-link': 'error',
        // SI: Speed Index (Good: <3.4s)
        'speed-index': ['error', { maxNumericValue: 3400 }],
        'splash-screen': 'warn',
        'structured-data': 'error',
        tabindex: 'error',
        'table-duplicate-name': 'error',
        'tap-targets': 'error',
        'td-headers-attr': 'error',
        'th-has-data-cells': 'error',
        'themed-omnibox': 'warn',
        'third-party-facades': 'warn',
        'third-party-summary': 'off', // AMP manages third-party
        // TBT: Total Blocking Time (Good: <200ms)
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'total-byte-weight': ['warn', { maxNumericValue: 1_600_000 }], // 1.6MB for AMP
        'unminified-css': 'error',
        'unminified-javascript': 'error',
        'unsized-images': 'error',
        'unused-css-rules': 'warn',
        'unused-javascript': 'off', // AMP runtime optimization
        'uses-http2': 'warn', // GitHub Pages limitation
        'uses-long-cache-ttl': 'warn',
        'uses-optimized-images': 'error',
        'uses-passive-event-listeners': 'error',
        'uses-rel-preconnect': 'warn',
        'uses-rel-preload': 'warn',
        'uses-responsive-images': 'error',
        'uses-text-compression': 'error',

        'uses-webp-images': 'warn',
        'valid-lang': 'error',
        'video-caption': 'error',
        viewport: 'error',
        'viewport-meta': 'error',
        'works-offline': 'warn',
      },
      // Strict preset with custom overrides for AMP excellence
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
        // Skip audits that don't apply to AMP
        skipAudits: [
          'uses-http2', // GitHub Pages limitation
          'bf-cache', // Not applicable to static sites
        ],
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
        'http://localhost/index.html',
        'http://localhost/about.html',
        'http://localhost/archive.html',
        'http://localhost/tags.html',
      ],
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
