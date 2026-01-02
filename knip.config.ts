// @ts-expect-error - Knip is a virtual module/cli dependency
import type { KnipConfig } from 'knip';

const config: KnipConfig = {
    entry: ['e2e/**/*.ts', 'lighthouserc.cjs', 'sw.js', 'assets/js/amp-search.js'],
    ignore: ['**/*.d.ts'],
    ignoreDependencies: ['@commitlint/cli', 'husky'],
    project: ['**/*.{ts,js}'],
};

export default config;
