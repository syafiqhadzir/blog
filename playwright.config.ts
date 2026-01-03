import { defineConfig, devices } from '@playwright/test';

const PERF_MODE = process.env['PERF_MODE'] === 'true';
const CI = !!process.env['CI'];

// Helper to determine worker count
// eslint-disable-next-line sonarjs/function-return-type
function getWorkerCount(): number | string | undefined {
    if (!CI) return undefined; // Let Playwright decide in non-CI
    return PERF_MODE ? 4 : '50%';
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
    reporter: CI ? [['html'], ['list']] : 'list',
    retries: CI ? 1 : 0,
    testDir: './tests',

    timeout: 30_000,

    use: {
        baseURL: 'http://127.0.0.1:5000',
        screenshot: 'only-on-failure',
        trace: 'on-first-retry',
        video: 'on-first-retry',
    },

    webServer: {
        command: 'npm run build && npm run serve:site',
        reuseExistingServer: !CI,
        stderr: 'pipe',
        stdout: 'pipe',
        timeout: 120 * 1000,
        url: 'http://127.0.0.1:5000',
    },

    workers: getWorkerCount(),
});
