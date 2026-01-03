import { defineConfig, devices } from '@playwright/test';
import os from 'node:os';

const PERF_MODE = process.env['PERF_MODE'] === 'true';
const CI = !!process.env['CI'];

// Helper to determine worker count
// eslint-disable-next-line sonarjs/function-return-type
function getWorkerCount(): number | string | undefined {
    if (!CI) return undefined; // Let Playwright decide in non-CI
    // In CI, use optimal worker count based on available CPUs
    return PERF_MODE ? Math.min(os.cpus().length, 8) : '50%';
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
        ? [['html', { open: 'never' }], ['list'], ['json', { outputFile: 'test-results/results.json' }]]
        : 'list',

    retries: CI ? 2 : 0, // Increased retries for CI flakiness
    testDir: './tests',

    // Reduced timeout for faster feedback
    timeout: 15_000,

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
        command: 'npm run build && npx http-server _site -p 5000 -c-1 --silent',
        reuseExistingServer: !CI,
        stderr: 'pipe',
        stdout: 'pipe',
        timeout: 120 * 1000,
        url: 'http://127.0.0.1:5000',
    },

    workers: getWorkerCount(),
});
