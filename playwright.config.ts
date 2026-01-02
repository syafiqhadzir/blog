import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    forbidOnly: !!process.env['CI'],
    fullyParallel: true,
    retries: process.env['CI'] ? 2 : 0,
    testDir: './e2e',
    ...(process.env['CI'] ? { workers: 1 } : {}),
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'mobile-safari',
            use: { ...devices['iPhone 12'] },
        },
    ],

    reporter: 'html',

    use: {
        baseURL: process.env['BASE_URL'] ?? 'http://127.0.0.1:4000/',
        screenshot: 'only-on-failure',
        trace: 'on-first-retry',
    },

    webServer: {
        command: 'bundle exec jekyll serve --port 4000',
        reuseExistingServer: !process.env['CI'],
        stderr: 'pipe',
        stdout: 'pipe',
        timeout: 180_000,
        url: 'http://127.0.0.1:4000/',
    },
});
