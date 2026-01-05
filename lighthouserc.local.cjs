/**
 * @fileoverview Lighthouse CI Configuration (Local Development)
 * Relaxed configuration for local development with faster runs
 * @license MIT
 */

const baseConfig = require('./lighthouserc.cjs');

module.exports = {
  ci: {
    assert: {
      ...baseConfig.ci.assert,
      assertions: {
        ...baseConfig.ci.assert.assertions,
        // Warnings instead of errors for local dev
        'categories:performance': ['warn', { minScore: 0.9 }],
        // Relaxed DOM size
        'dom-size': ['warn', { maxNumericValue: 2500 }],
        // Relaxed LCP for local dev
        'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
      },
    },
    collect: {
      ...baseConfig.ci.collect,
      // Single run for speed in local development
      numberOfRuns: 1,
      settings: {
        ...baseConfig.ci.collect.settings,
        // Relaxed thresholds for local dev
        throttling: {
          cpuSlowdownMultiplier: 2, // Less CPU throttling
          downloadThroughputKbps: 3276.8, // Faster network
          requestLatencyMs: 75,
          rttMs: 75,
          throughputKbps: 3276.8,
          uploadThroughputKbps: 1350,
        },
      },
    },
    upload: {
      target: 'none',
    },
  },
};
