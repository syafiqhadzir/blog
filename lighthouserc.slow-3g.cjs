/**
 * @fileoverview Lighthouse CI Configuration (Slow 3G Network)
 * Testing on Slow 3G for worst-case scenarios
 * @license MIT
 */

const baseConfig = require('./lighthouserc.cjs');

module.exports = {
  ci: {
    assert: {
      ...baseConfig.ci.assert,
      assertions: {
        ...baseConfig.ci.assert.assertions,
        // Very relaxed thresholds for Slow 3G
        'categories:performance': ['warn', { minScore: 0.7 }], // 70% acceptable
        'first-contentful-paint': ['warn', { maxNumericValue: 5000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 7500 }],
        'speed-index': ['warn', { maxNumericValue: 8000 }],
        'total-blocking-time': ['warn', { maxNumericValue: 600 }],
      },
    },
    collect: {
      ...baseConfig.ci.collect,
      numberOfRuns: 1, // Single run for very slow network
      settings: {
        ...baseConfig.ci.collect.settings,
        // Slow 3G network throttling
        throttling: {
          cpuSlowdownMultiplier: 4,
          downloadThroughputKbps: 400, // 400 Kbps
          requestLatencyMs: 2000, // 2s latency
          rttMs: 2000,
          throughputKbps: 400,
          uploadThroughputKbps: 400,
        },
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
