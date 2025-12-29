import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env['CI'],
    retries: process.env['CI'] ? 2 : 0,
    ...(process.env['CI'] ? { workers: 1 } : {}),
    reporter: 'html',

    use: {
        baseURL: process.env['BASE_URL'] || 'http://localhost:4000/',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },

    // Visual Regression Testing Configuration
    snapshotDir: './e2e/snapshots',
    snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-{projectName}/{arg}{ext}',
    expect: {
        toHaveScreenshot: {
            // Allow 0.5% pixel difference for anti-aliasing variations
            maxDiffPixelRatio: 0.005,
            // Animation stabilization timeout
            animations: 'disabled',
            // Scale to consistent size
            scale: 'css',
        },
        toMatchSnapshot: {
            maxDiffPixelRatio: 0.005,
        },
    },

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

    webServer: {
        command: 'bundle exec jekyll serve --port 4000',
        url: 'http://localhost:4000/',
        reuseExistingServer: !process.env['CI'],
        timeout: 180000,
        stdout: 'pipe',
        stderr: 'pipe',
    },
});
