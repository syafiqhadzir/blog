/**
 * @fileoverview Competitive benchmarking against industry leaders
 * @license MIT
 */

/* eslint-disable no-console, unicorn/no-process-exit */

import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const COMPETITORS = [
  { name: 'Vercel Blog', url: 'https://vercel.com/blog' },
  { name: 'Netlify Blog', url: 'https://www.netlify.com/blog/' },
  { name: 'GitHub Blog', url: 'https://github.blog/' },
];

/**
 * Run competitive benchmark
 * @returns {Promise<void>}
 */
async function runBenchmark() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    console.log('🏁 Running competitive benchmark...\n');

    for (const competitor of COMPETITORS) {
      console.log(`📊 Testing ${competitor.name}...`);
      const metrics = await runLighthouse(competitor.url, browser);

      results.push({
        metrics,
        name: competitor.name,
        url: competitor.url,
      });

      console.log(`✅ ${competitor.name} complete\n`);
    }

    // Generate report
    const report = {
      date: new Date().toISOString(),
      results,
    };

    await writeFile(
      './lighthouse/benchmarks/competitive-report.json',
      JSON.stringify(report, undefined, 2),
    );

    console.log('🎉 Benchmark complete!');
    console.log(
      '📁 Report saved to ./lighthouse/benchmarks/competitive-report.json',
    );
  } catch (error) {
    console.error('❌ Benchmark failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

/**
 * Run Lighthouse on a URL
 * @param {string} url - URL to test
 * @param {import('playwright').Browser} browser - Browser instance
 * @returns {Promise<object>} Lighthouse results
 */
async function runLighthouse(url, browser) {
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle' });

    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');

      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        fcp:
          paint.find((entry) => entry.name === 'first-contentful-paint')
            ?.startTime || 0,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      };
    });

    return metrics;
  } finally {
    await page.close();
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await runBenchmark();
}

export { runBenchmark, runLighthouse };
