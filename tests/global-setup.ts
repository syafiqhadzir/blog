import type { FullConfig } from '@playwright/test';

import { chromium } from '@playwright/test';
import { exec } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

async function globalSetup(config: FullConfig): Promise<void> {
    process.stdout.write(String.raw`🔨 Building site...` + '\n');

    // Build the site once for all tests
    try {
        await execAsync('npm run build', { cwd: process.cwd() });
        process.stdout.write(String.raw`✅ Site built successfully` + '\n');
    } catch (error) {
        process.stderr.write(String.raw`❌ Build failed: ${String(error)}` + '\n');
        throw error;
    }

    // Start http-server in background
    process.stdout.write(String.raw`🚀 Starting http-server...` + '\n');
    // eslint-disable-next-line sonarjs/no-os-command-from-path
    const serverProcess = exec('npx http-server _site -p 5000 -c-1 --silent');

    // Store PID for cleanup
    const pidFile = path.join(process.cwd(), '.server.pid');
    if (serverProcess.pid) {
        fs.writeFileSync(pidFile, String(serverProcess.pid));
    }

    // Wait for server to be ready
    const firstProject = config.projects[0];
    const baseURL = firstProject?.use.baseURL ?? 'http://127.0.0.1:5000';
    let retries = 0;
    const maxRetries = 30;

    while (retries < maxRetries) {
        try {
            const browser = await chromium.launch();
            const page = await browser.newPage();
            await page.goto(baseURL, { timeout: 2000 });
            await browser.close();
            process.stdout.write(String.raw`✅ Server ready` + '\n');
            break;
        } catch {
            retries++;
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    if (retries === maxRetries) {
        throw new Error('Server failed to start');
    }
}

export default globalSetup;
