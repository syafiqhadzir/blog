/**
 * @fileoverview Lighthouse trends dashboard
 * @license MIT
 */

import { readdir, readFile } from 'node:fs/promises';

/**
 * Calculate trends from reports
 * @param {Array} reports - Lighthouse reports
 * @returns {object} Trend data
 */
function calculateTrends(reports) {
  const PERCENTAGE_FACTOR = 100;

  const sorted = reports.toSorted(
    (a, b) => new Date(a.fetchTime) - new Date(b.fetchTime),
  );

  const trends = {
    accessibility: [],
    bestPractices: [],
    dates: [],
    performance: [],
    seo: [],
  };

  for (const report of sorted) {
    trends.dates.push(new Date(report.fetchTime).toLocaleDateString());
    trends.performance.push(
      Math.round(report.categories.performance.score * PERCENTAGE_FACTOR),
    );
    trends.accessibility.push(
      Math.round(report.categories.accessibility.score * PERCENTAGE_FACTOR),
    );
    trends.bestPractices.push(
      Math.round(report.categories['best-practices'].score * PERCENTAGE_FACTOR),
    );
    trends.seo.push(
      Math.round(report.categories.seo.score * PERCENTAGE_FACTOR),
    );
  }

  return trends;
}

/**
 * Generate HTML dashboard
 * @param {object} trends - Trend data
 * @returns {string} HTML content
 */
function generateDashboard(trends) {
  const chartData = {
    datasets: [
      {
        borderColor: 'rgb(255, 99, 132)',
        data: trends.performance,
        label: 'Performance',
        tension: 0.1,
      },
      {
        borderColor: 'rgb(54, 162, 235)',
        data: trends.accessibility,
        label: 'Accessibility',
        tension: 0.1,
      },
      {
        borderColor: 'rgb(255, 206, 86)',
        data: trends.bestPractices,
        label: 'Best Practices',
        tension: 0.1,
      },
      {
        borderColor: 'rgb(75, 192, 192)',
        data: trends.seo,
        label: 'SEO',
        tension: 0.1,
      },
    ],
    labels: trends.dates,
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lighthouse Trends Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
  <style>
    body { font-family: system-ui; max-width: 1200px; margin: 0 auto; padding: 2rem; }
    h1 { color: #333; }
    .chart-container { margin: 2rem 0; }
  </style>
</head>
<body>
  <h1>📊 Lighthouse Trends Dashboard</h1>
  <div class="chart-container">
    <canvas id="trendsChart"></canvas>
  </div>
  <script>
    const ctx = document.getElementById('trendsChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: ${JSON.stringify(chartData)},
      options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
    });
  </script>
</body>
</html>`;
}

/**
 * Parse Lighthouse JSON reports
 * @param {string} directory - Directory containing reports
 * @returns {Promise<Array>} Parsed reports
 */
async function parseReports(directory) {
  const files = await readdir(directory);
  const jsonFiles = files.filter((file) => file.endsWith('.json'));

  const reports = await Promise.all(
    jsonFiles.map(async (file) => {
      const content = await readFile(`${directory}/${file}`, 'utf8');
      return JSON.parse(content);
    }),
  );

  return reports;
}

export { calculateTrends, generateDashboard, parseReports };
