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
        // Stricter LCP for CI (less variability)
        'largest-contentful-paint': ['error', { maxNumericValue: 2600 }],
      },
    },
    collect: {
      ...baseConfig.ci.collect,
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
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
