/* eslint-disable no-console */
import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { injectManifest } from 'workbox-build';

console.log('🏗️  Starting Service Worker Build...');

const SITE_DIR = path.resolve(process.cwd(), '_site');
const SRC_SW = path.resolve(process.cwd(), 'sw-source.js');
const TMP_SW = path.resolve(process.cwd(), 'scripts', 'sw-injected.tmp.js');
const DEST_SW = path.resolve(SITE_DIR, 'sw.js');

console.log(`Debug: SITE_DIR=${SITE_DIR}`);
console.log(`Debug: SRC_SW=${SRC_SW}`);

if (!fs.existsSync(SRC_SW)) {
  throw new Error('❌ Source SW (sw-source.js) not found!');
}

if (!fs.existsSync(SITE_DIR)) {
  throw new Error('❌ _site directory not found. Run Jekyll build first.');
}

if (!fs.statSync(SITE_DIR).isDirectory()) {
  throw new Error('❌ _site is not a directory!');
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

  const { count, size } = buildResult;
  const KILO_BYTE = 1024;
  const mbSize = (size / KILO_BYTE / KILO_BYTE).toFixed(2);
  console.log(`   - Precaching ${String(count)} files (${mbSize} MB)`);

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
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
}
