/* eslint-disable no-console */
import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { injectManifest } from 'workbox-build';

async function buildSW() {
    console.log('🏗️  Starting Service Worker Build...');

    const SITE_DIR = path.resolve(process.cwd(), '_site');
    const SRC_SW = path.resolve(process.cwd(), 'sw-source.js');
    const TMP_SW = path.resolve(process.cwd(), 'scripts', 'sw-injected.tmp.js');
    const DEST_SW = path.resolve(SITE_DIR, 'sw.js');

    console.log(`Debug: SITE_DIR=${SITE_DIR}`);
    console.log(`Debug: SRC_SW=${SRC_SW}`);

    if (!fs.existsSync(SRC_SW)) {
        console.error('❌ Source SW (sw-source.js) not found!');
        process.exit(1);
    }

    if (!fs.existsSync(SITE_DIR)) {
        console.error('❌ _site directory not found. Run Jekyll build first.');
        process.exit(1);
    }

    if (!fs.statSync(SITE_DIR).isDirectory()) {
        console.error('❌ _site is not a directory!');
        process.exit(1);
    }

    try {
        // 1. Inject Manifest
        console.log('📦 Injecting Precache Manifest...');
        const buildResult = await injectManifest({
            globDirectory: SITE_DIR,
            // Ignore the SW itself, map files, and huge media if any
            globIgnores: ['sw.js', '**/*.map', 'assets/videos/**/*'],
            // Cache HTML, CSS, JS, Images, Fonts
            globPatterns: ['**/*.{html,css,js,png,jpg,jpeg,webp,svg,xml,txt,ico,json}'],
            swDest: TMP_SW,
            swSrc: SRC_SW,
        });

        // Workbox v7 returns { count, size, warnings }
        const { count, size } = buildResult;
        console.log(`   - Precaching ${String(count)} files (${(size / 1024 / 1024).toFixed(2)} MB)`);

        // 2. Bundle with esbuild
        console.log('🚀 Bundling Service Worker with esbuild...');
        await esbuild.build({
            bundle: true,
            define: {
                'process.env.NODE_ENV': '"production"',
            },
            entryPoints: [TMP_SW],
            format: 'iife',
            legalComments: 'none',
            minify: true,
            outfile: DEST_SW,
            platform: 'browser',
            sourcemap: false,
            target: ['es2018'],
        });
        console.log(`✅ Service Worker bundled to: ${DEST_SW}`);

        // Cleanup temp file
        if (fs.existsSync(TMP_SW)) {
            fs.unlinkSync(TMP_SW);
        }
    } catch (error) {
        console.error('❌ Service Worker Build Failed:', error);
        process.exit(1);
    }
}

await buildSW();
