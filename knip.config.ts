// @ts-expect-error - Knip is a virtual module/cli dependency
import type { KnipConfig } from 'knip';

const config: KnipConfig = {
    entry: ['e2e/**/*.ts', 'lighthouserc.cjs', 'sw.js', 'assets/js/amp-search.js'],
    project: ['**/*.{ts,js}'],
    ignore: ['**/*.d.ts'],
    ignoreDependencies: ['@commitlint/cli', 'html-minifier-terser', 'imagemin-mozjpeg', 'imagemin-pngquant'],
};

export default config;
