/**
 * @fileoverview Lighthouse CI Configuration (3G Network)
 * Testing on 3G network conditions for emerging markets
 * @license MIT
 */

const baseConfig = require('./lighthouserc.cjs');

module.exports = {
  ci: {
    assert: {
      ...baseConfig.ci.assert,
      assertions: {
        ...baseConfig.ci.assert.assertions,
        // Relaxed thresholds for 3G
        'first-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 4500 }],
        'speed-index': ['error', { maxNumericValue: 5500 }],
        'total-blocking-time': ['error', { maxNumericValue: 400 }],
      },
    },
    collect: {
      ...baseConfig.ci.collect,
      numberOfRuns: 2, // Fewer runs for slower network
      settings: {
        ...baseConfig.ci.collect.settings,
        // 3G network throttling
        throttling: {
          cpuSlowdownMultiplier: 4,
          downloadThroughputKbps: 1600, // 1.6 Mbps
          requestLatencyMs: 300,
          rttMs: 300,
          throughputKbps: 1600,
          uploadThroughputKbps: 750,
        },
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
