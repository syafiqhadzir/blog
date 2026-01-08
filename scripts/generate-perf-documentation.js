/**
 * @fileoverview Automated performance documentation generator
 * @license MIT
 */

import { readFile, writeFile } from 'node:fs/promises';

/**
 * Generate performance documentation from Lighthouse reports
 * @param {string} reportPath - Path to Lighthouse report
 * @returns {Promise<string>} Generated documentation
 */
const PERCENTAGE_FACTOR = 100;
const SCORE_THRESHOLD = 0.9;

/**
 * Format core web vitals
 * @param {object} audits - Lighthouse audits
 * @returns {string} Formatted vitals
 */
function formatCoreWebVitals(audits) {
  return `- **LCP**: ${audits['largest-contentful-paint'].displayValue}
- **FCP**: ${audits['first-contentful-paint'].displayValue}
- **TBT**: ${audits['total-blocking-time'].displayValue}
- **CLS**: ${audits['cumulative-layout-shift'].displayValue}`;
}

/**
 * Format scores table
 * @param {object} scores - Category scores
 * @returns {string} Formatted table
 */
function formatScoresTable(scores) {
  return `| Category | Score |
|----------|-------|
| Performance | ${Math.round(scores.performance.score * PERCENTAGE_FACTOR)}% |
| Accessibility | ${Math.round(scores.accessibility.score * PERCENTAGE_FACTOR)}% |
| Best Practices | ${Math.round(scores['best-practices'].score * PERCENTAGE_FACTOR)}% |
| SEO | ${Math.round(scores.seo.score * PERCENTAGE_FACTOR)}% |`;
}

/**
 * Generate performance documentation from Lighthouse reports
 * @param {string} reportPath - Path to Lighthouse report
 * @returns {Promise<string>} Generated documentation
 */
async function generatePerfDocumentation(reportPath) {
  const reportContent = await readFile(reportPath, 'utf8');
  const report = JSON.parse(reportContent);

  const scores = report.categories;
  const audits = report.audits;

  let documentation = `# Performance Report

Generated: ${new Date().toISOString()}

## Scores

${formatScoresTable(scores)}

## Core Web Vitals

${formatCoreWebVitals(audits)}

## Recommendations

`;

  // Add failing audits as recommendations
  for (const audit of Object.values(audits)) {
    if (audit.score !== null && audit.score < SCORE_THRESHOLD) {
      documentation += `### ${audit.title}\n`;
      documentation += `${audit.description}\n\n`;
    }
  }

  return documentation;
}

/**
 * Update performance documentation
 * @returns {Promise<void>}
 */
async function updateDocumentation() {
  const documentation = await generatePerfDocumentation(
    '.lighthouseci/lhr-0.json',
  );
  await writeFile('docs/PERFORMANCE.md', documentation);
  console.log('✅ Performance documentation updated');
}

export { generatePerfDocumentation, updateDocumentation };
