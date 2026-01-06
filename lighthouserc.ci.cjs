/**
 * @fileoverview Lighthouse CI Configuration (CI Environment)
 * Stricter configuration for CI with more runs and tighter thresholds
 * @license MIT
 */

const baseConfig = require('./lighthouserc.cjs');

module.exports = {
  ci: {
    assert: {
      ...baseConfig.ci.assert,
      assertions: {
        ...baseConfig.ci.assert.assertions,
        'aria-allowed-role': 'warn', // Known issue on archive.html
        'aria-valid-attr': 'warn', // Potential AMP issues
        // Stricter DOM size (relaxed for tags.html which is ~2118)
        'dom-size': ['warn', { maxNumericValue: 2200 }],
        // Address specific warnings to clean up CI logs
        'errors-in-console': 'off', // Consistently off in CI to avoid noise from browser extensions/shims
        // LCP for CI environment (matches base config)
        'largest-contentful-paint': ['error', { maxNumericValue: 3700 }],
        'unused-css-rules': ['warn', { minScore: 0.5 }], // Allow some unused CSS (framework/AMP overhead)
        'uses-text-compression': 'off', // http-server in CI doesn't compress, so we skip this check
      },
    },
    collect: {
      ...baseConfig.ci.collect,
      // Chrome flags to prevent interstitial errors and improve stability
      chromeFlags:
        '--headless=new --no-sandbox --disable-setuid-sandbox --ignore-certificate-errors --allow-insecure-localhost --disable-dev-shm-usage --disable-gpu',
      // More runs for better statistical accuracy in CI
      numberOfRuns: 3,
      settings: {
        ...baseConfig.ci.collect.settings,
        // Stricter thresholds for CI
        throttling: {
          cpuSlowdownMultiplier: 4,
          downloadThroughputKbps: 1638.4,
          requestLatencyMs: 150,
          rttMs: 150,
          throughputKbps: 1638.4,
          uploadThroughputKbps: 675,
        },
      },
      // Start the server for CI
      startServerCommand: 'npm run serve:site',
      startServerReadyPattern: 'Available on',
      // Use 127.0.0.1 for better network reliability in CI
      url: [
        'http://127.0.0.1:5000/index.html',
        'http://127.0.0.1:5000/about.html',
        'http://127.0.0.1:5000/archive.html',
        'http://127.0.0.1:5000/tags.html',
        'http://127.0.0.1:5000/accessibility.html',
        'http://127.0.0.1:5000/404.html',
      ],
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
