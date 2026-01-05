/**
 * @fileoverview Automated performance documentation generator
 * @license MIT
 */

/* eslint-disable no-console */

import { readFile, writeFile } from 'node:fs/promises';

/**
 * Generate performance documentation from Lighthouse reports
 * @param {string} reportPath - Path to Lighthouse report
 * @returns {Promise<string>} Generated documentation
 */
const PERCENTAGE_FACTOR = 100;
const SCORE_THRESHOLD = 0.9;

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

| Category | Score |
|----------|-------|
| Performance | ${Math.round(scores.performance.score * PERCENTAGE_FACTOR)}% |
| Accessibility | ${Math.round(scores.accessibility.score * PERCENTAGE_FACTOR)}% |
| Best Practices | ${Math.round(scores['best-practices'].score * PERCENTAGE_FACTOR)}% |
| SEO | ${Math.round(scores.seo.score * PERCENTAGE_FACTOR)}% |

## Core Web Vitals

- **LCP**: ${audits['largest-contentful-paint'].displayValue}
- **FCP**: ${audits['first-contentful-paint'].displayValue}
- **TBT**: ${audits['total-blocking-time'].displayValue}
- **CLS**: ${audits['cumulative-layout-shift'].displayValue}

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
