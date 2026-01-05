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
async function generatePerfDocs(reportPath) {
  const reportContent = await readFile(reportPath, 'utf8');
  const report = JSON.parse(reportContent);

  const scores = report.categories;
  const audits = report.audits;

  let documentation = `# Performance Report

Generated: ${new Date().toISOString()}

## Scores

| Category | Score |
|----------|-------|
| Performance | ${Math.round(scores.performance.score * 100)}% |
| Accessibility | ${Math.round(scores.accessibility.score * 100)}% |
| Best Practices | ${Math.round(scores['best-practices'].score * 100)}% |
| SEO | ${Math.round(scores.seo.score * 100)}% |

## Core Web Vitals

- **LCP**: ${audits['largest-contentful-paint'].displayValue}
- **FCP**: ${audits['first-contentful-paint'].displayValue}
- **TBT**: ${audits['total-blocking-time'].displayValue}
- **CLS**: ${audits['cumulative-layout-shift'].displayValue}

## Recommendations

`;

  // Add failing audits as recommendations
  for (const [auditId, audit] of Object.entries(audits)) {
    if (audit.score !== null && audit.score < 0.9) {
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
async function updateDocs() {
  const docs = await generatePerfDocs('.lighthouseci/lhr-0.json');
  await writeFile('docs/PERFORMANCE.md', docs);
  console.log('✅ Performance documentation updated');
}

export { generatePerfDocs, updateDocs };
