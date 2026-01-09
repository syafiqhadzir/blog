import { defineConfig, devices } from '@playwright/test';
import os from 'node:os';

const PERF_MODE = process.env['PERF_MODE'] === 'true';
const CI = process.env['CI'] != undefined && process.env['CI'].length > 0;

// Helper to determine worker count
function getWorkerCount(): number {
  const cpuCount = os.cpus().length;
  if (PERF_MODE) {
    return Math.min(cpuCount, 8);
  }
  return Math.max(1, Math.floor(cpuCount / 2));
}

export default defineConfig({
  expect: {
    timeout: 5000,
  },
  forbidOnly: CI,
  fullyParallel: true,

  projects: [
    {
      grep: /@fast/,
      name: 'fast-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      grep: /@full|@fast/,
      name: 'full-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      grep: /@full|@fast/,
      name: 'full-firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      grep: /@full|@fast/,
      name: 'full-webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Optimized reporter configuration
  reporter: CI
    ? [
        ['html', { open: 'never' }],
        ['list'],
        ['json', { outputFile: 'test-results/results.json' }],
      ]
    : 'list',

  retries: CI ? 2 : 0, // Increased retries for CI flakiness
  testDir: './tests',

  // Increased timeout for better stability in CI
  timeout: 30_000,

  use: {
    // Performance optimizations
    actionTimeout: 5000,
    baseURL: 'http://127.0.0.1:5000',
    navigationTimeout: 10_000,

    // Only capture on failure for performance
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },

  // Use webServer for reliable build-once-serve-static pattern
  webServer: {
    command:
      process.env['SKIP_BUILD'] != undefined &&
      process.env['SKIP_BUILD'].length > 0
        ? 'npx http-server _site -p 5000 -c-1 --silent'
        : 'npm run build && npx http-server _site -p 5000 -c-1 --silent',
    reuseExistingServer: !CI,
    stderr: 'pipe',
    stdout: 'pipe',
    timeout: 120 * 1000,
    url: 'http://127.0.0.1:5000',
  },

  workers: getWorkerCount(),
});
