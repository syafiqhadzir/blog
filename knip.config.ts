import type { KnipConfig } from 'knip';

const config: KnipConfig = {
    entry: [
        'src/index.ts',
        'e2e/**/*.ts',
        'scripts/**/*.ts',
        'playwright.config.ts',
        'commitlint.config.js',
        'eslint.config.js',
        'stylelint.config.js',
        'lighthouserc.cjs',
        'sw.js',
    ],
    project: ['**/*.{ts,js}'],
    ignore: ['**/*.d.ts'],
    ignoreDependencies: [
        'typescript',
        'eslint-config-prettier',
        'npm-run-all',
        'onchange', // if used in scripts
    ],
};

export default config;
