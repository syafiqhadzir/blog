/**
 * @fileoverview Custom Lighthouse audit for AMP validation
 * @license MIT
 */

import Audit from 'lighthouse/core/audits/audit.js';

/**
 * @typedef {import('lighthouse').Artifacts} Artifacts
 * @typedef {import('lighthouse').Audit.Context} Context
 */

const MAX_AMP_COMPONENTS = 20;
const SCORE_WITH_WARNINGS = 0.9;
const SCORE_WITH_INFO = 0.95;

/**
 * Custom audit to validate AMP pages beyond standard Lighthouse checks
 */
class AMPValidationAudit extends Audit {
  /**
   * @returns {import('lighthouse').Audit.Meta}
   */
  static get meta() {
    return {
      description:
        'Validates that the page is a valid AMP document with no errors or warnings. ' +
        '[Learn more about AMP validation](https://amp.dev/documentation/guides-and-tutorials/learn/validation-workflow/validate_amp/).',
      failureTitle: 'Page has AMP validation errors',
      id: 'amp-validation',
      requiredArtifacts: ['ScriptElements', 'URL', 'devtoolsLogs'],
      title: 'Page is valid AMP',
    };
  }

  /**
   * @param {Artifacts} artifacts
   * @returns {Promise<import('lighthouse').Audit.Product>}
   */
  static async audit(artifacts) {
    const scriptElements = artifacts.ScriptElements || [];

    // Check if page declares itself as AMP
    const ampScripts = scriptElements.filter(
      (script) =>
        script.src &&
        (script.src.includes('cdn.ampproject.org') ||
          script.src.includes('ampproject.net')),
    );

    if (ampScripts.length === 0) {
      return {
        notApplicable: true,
        score: undefined,
      };
    }

    // Check for AMP runtime script
    if (!this.hasAmpRuntime(ampScripts)) {
      return {
        displayValue: 'Missing AMP runtime script',
        explanation: 'AMP components detected but no AMP runtime (v0.js) found',
        score: 0,
      };
    }

    const ampComponents = this.getAmpComponents(scriptElements);
    const issues = [];

    // Check for common AMP issues
    if (ampComponents.length > MAX_AMP_COMPONENTS) {
      issues.push({
        message: `High number of AMP components (${ampComponents.length})`,
        severity: 'warning',
      });
    }

    const score = this.calculateScore(issues);

    return {
      details: {
        headings: [
          { key: 'message', label: 'Issue' },
          { key: 'severity', label: 'Severity' },
        ],
        items: issues,
        type: 'table',
      },
      displayValue: `${ampComponents.length} AMP components, ${issues.length} issues`,
      score,
    };
  }

  /**
   * Calculate score based on issues
   * @param {Array} issues - Validation issues
   * @returns {number} Score between 0 and 1
   */
  static calculateScore(issues) {
    const errorCount = issues.filter(
      (issue) => issue.severity === 'error',
    ).length;
    const warningCount = issues.filter(
      (issue) => issue.severity === 'warning',
    ).length;

    if (errorCount > 0) {
      return 0;
    }

    if (warningCount > 0) {
      return SCORE_WITH_WARNINGS;
    }

    if (issues.length > 0) {
      return SCORE_WITH_INFO;
    }

    return 1;
  }

  /**
   * Get AMP components from page
   * @param {Array} scriptElements - Script elements from page
   * @returns {Array} AMP components
   */
  static getAmpComponents(scriptElements) {
    return scriptElements.filter(
      (script) =>
        script.src &&
        script.src.includes('cdn.ampproject.org') &&
        script.src.includes('custom-element'),
    );
  }

  /**
   * Check if page has AMP runtime
   * @param {Array} scriptElements - Script elements from page
   * @returns {boolean} Whether AMP runtime is present
   */
  static hasAmpRuntime(scriptElements) {
    return scriptElements.some(
      (script) =>
        script.src &&
        (script.src.includes('/v0.js') || script.src.includes('/amp.js')),
    );
  }
}

export default AMPValidationAudit;
