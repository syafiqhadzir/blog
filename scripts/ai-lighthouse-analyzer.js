/**
 * @fileoverview AI-powered Lighthouse analysis using LLM
 * @license MIT
 */

/* eslint-disable no-console */

import { readFile } from 'node:fs/promises';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Analyze Lighthouse report with AI
 * @param {string} reportPath - Path to Lighthouse JSON report
 * @returns {Promise<string>} AI analysis
 */
async function analyzeLighthouseReport(reportPath) {
  const reportContent = await readFile(reportPath, 'utf8');
  const report = JSON.parse(reportContent);

  // Extract key issues
  const issues = [];
  for (const [auditId, audit] of Object.entries(report.audits)) {
    if (audit.score !== null && audit.score < 0.9) {
      issues.push({
        description: audit.description,
        id: auditId,
        score: audit.score,
        title: audit.title,
      });
    }
  }

  if (!OPENAI_API_KEY) {
    console.warn('⚠️ OPENAI_API_KEY not set. Returning basic analysis.');
    return generateBasicAnalysis(issues);
  }

  // Call OpenAI API for detailed analysis
  const prompt = `Analyze these Lighthouse audit failures and provide:
1. Plain English explanation of each issue
2. Specific code fixes with examples
3. Priority ranking by impact

Issues:
${JSON.stringify(issues, null, 2)}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      body: JSON.stringify({
        messages: [
          { content: 'You are a web performance expert.', role: 'system' },
          { content: prompt, role: 'user' },
        ],
        model: 'gpt-4',
      }),
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('❌ AI analysis failed:', error);
    return generateBasicAnalysis(issues);
  }
}

/**
 * Generate basic analysis without AI
 * @param {Array} issues - Lighthouse issues
 * @returns {string} Basic analysis
 */
function generateBasicAnalysis(issues) {
  let analysis = '## Lighthouse Analysis\n\n';

  if (issues.length === 0) {
    return analysis + '✅ All audits passing! No issues found.';
  }

  analysis += `Found ${issues.length} issues:\n\n`;

  for (const issue of issues) {
    analysis += `### ${issue.title}\n`;
    analysis += `Score: ${Math.round(issue.score * 100)}%\n`;
    analysis += `${issue.description}\n\n`;
  }

  return analysis;
}

export { analyzeLighthouseReport, generateBasicAnalysis };
