import { expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

import type { PerfMetrics } from './_helpers/fixtures';

import { test } from './_helpers/fixtures';

test.describe('Performance Metrics', { tag: ['@full', '@perf'] }, () => {
  const results: PerfMetrics[] = [];

  test.afterAll(() => {
    const resultsDirectory = path.resolve('test-results');
    try {
      if (!fs.existsSync(resultsDirectory)) {
        fs.mkdirSync(resultsDirectory, { recursive: true });
      }
    } catch {
      // Ignore if dir exists or creation fails
    }

    fs.writeFileSync(
      path.join(resultsDirectory, 'perf.json'),
      JSON.stringify(results, undefined, 2),
    );
  });

  test('Collect metrics for key pages', async ({
    collectPerfMetrics,
    page,
  }) => {
    const pagesToTest = ['/', '/archive.html'];

    for (const route of pagesToTest) {
      await page.goto(route);
      results.push(await collectPerfMetrics(page));
    }

    const loadMax = Number.parseInt(process.env['LOAD_MAX'] ?? '3500', 10);

    for (const result of results) {
      expect(result.loaded, `Page ${result.url} too slow`).toBeLessThan(
        loadMax,
      );
    }
  });
});
