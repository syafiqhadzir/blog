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
        // Stricter DOM size
        'dom-size': ['warn', { maxNumericValue: 2100 }],
        // LCP for CI environment (matches base config)
        'largest-contentful-paint': ['error', { maxNumericValue: 3700 }],
      },
    },
    collect: {
      ...baseConfig.ci.collect,
      // Chrome flags to prevent interstitial errors in CI
      chromeFlags:
        '--no-sandbox --disable-setuid-sandbox --ignore-certificate-errors --allow-insecure-localhost --disable-dev-shm-usage',
      // More runs for better statistical accuracy in CI
      numberOfRuns: 5,
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
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
