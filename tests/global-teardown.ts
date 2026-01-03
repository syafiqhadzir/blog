import { exec } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function globalTeardown(): void {
    process.stdout.write(String.raw`🧹 Cleaning up...` + '\n');

    // Stop http-server
    const pidFile = path.join(process.cwd(), '.server.pid');

    if (fs.existsSync(pidFile)) {
        const pid = fs.readFileSync(pidFile, 'utf8').trim();

        try {
            // Kill server process
            if (process.platform === 'win32') {
                // eslint-disable-next-line sonarjs/os-command
                exec(String.raw`taskkill /PID ${pid} /F /T`);
            } else {
                // eslint-disable-next-line sonarjs/os-command
                exec(String.raw`kill -9 ${pid}`);
            }
            process.stdout.write(String.raw`✅ Server stopped` + '\n');
        } catch (error) {
            process.stderr.write(String.raw`⚠️  Failed to stop server: ${String(error)}` + '\n');
        }

        // Clean up PID file
        fs.unlinkSync(pidFile);
    }

    process.stdout.write(String.raw`✅ Cleanup complete` + '\n');
}

export default globalTeardown;
