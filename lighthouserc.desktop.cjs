/**
 * @fileoverview Lighthouse CI Configuration (Desktop)
 * Desktop-specific configuration with adjusted thresholds
 * @license MIT
 */

const baseConfig = require('./lighthouserc.cjs');

module.exports = {
  ci: {
    assert: {
      ...baseConfig.ci.assert,
      assertions: {
        ...baseConfig.ci.assert.assertions,
        // Desktop-specific adjustments
        'dom-size': ['warn', { maxNumericValue: 2500 }], // Desktop can handle more
        'largest-contentful-paint': ['error', { maxNumericValue: 2400 }], // Faster on desktop
        'speed-index': ['error', { maxNumericValue: 3000 }], // Better on desktop
      },
    },
    collect: {
      ...baseConfig.ci.collect,
      settings: {
        ...baseConfig.ci.collect.settings,
        // Desktop form factor
        formFactor: 'desktop',
        screenEmulation: {
          disabled: false,
          height: 940,
          mobile: false,
          width: 1350,
        },
        // Desktop throttling (faster than mobile)
        throttling: {
          cpuSlowdownMultiplier: 2,
          downloadThroughputKbps: 10_240, // 10 Mbps
          requestLatencyMs: 40,
          rttMs: 40,
          throughputKbps: 10_240,
          uploadThroughputKbps: 5120,
        },
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
