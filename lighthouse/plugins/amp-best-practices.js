/**
 * @fileoverview Custom Lighthouse plugin for AMP best practices
 * @license MIT
 */

/**
 * AMP Best Practices Plugin
 */
const ampBestPracticesPlugin = {
  audits: [
    {
      implementation: './audits/amp-cache-headers.js',
      path: 'amp-cache-headers',
    },
    {
      implementation: './audits/amp-component-usage.js',
      path: 'amp-component-usage',
    },
    {
      implementation: './audits/amp-runtime-version.js',
      path: 'amp-runtime-version',
    },
  ],

  category: {
    auditRefs: [
      { id: 'amp-cache-headers', weight: 1 },
      { id: 'amp-component-usage', weight: 1 },
      { id: 'amp-runtime-version', weight: 1 },
    ],
    description: 'Validates AMP-specific best practices',
    title: 'AMP Best Practices',
  },
};

export default ampBestPracticesPlugin;
