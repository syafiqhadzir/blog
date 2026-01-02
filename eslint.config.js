// @ts-check
import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import perfectionist from 'eslint-plugin-perfectionist';
import playwright from 'eslint-plugin-playwright';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('typescript-eslint').ConfigArray} */
/** @type {import('typescript-eslint').ConfigArray} */
export default [
    // Global ignores
    {
        ignores: [
            '_site/**',
            'vendor/**',
            'coverage/**',
            'playwright-report/**',
            'sw.js',
            'test-results/**',
            'scripts/seo-audit.js',
        ],
    },

    // Base configs
    js.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,

    // Plugin configs
    /** @type {any} */ (sonarjs.configs.recommended),
    /** @type {any} */ (unicorn.configs.recommended),
    /** @type {any} */ (perfectionist.configs['recommended-natural']),

    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },

    // Node.js config files
    {
        files: ['lighthouserc.js', 'lighthouserc.cjs', '*.config.js', '**/*.cjs', 'scripts/*.js'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },

    // Browser files - disable type-checked for legacy assets
    {
        files: ['assets/js/**/*.js'],
        ...tseslint.configs.disableTypeChecked,
        languageOptions: {
            globals: globals.browser,
        },
    },

    // Scripts - disable type-checked due to missing library types
    {
        files: ['scripts/**/*.js'],
        ...tseslint.configs.disableTypeChecked,
        languageOptions: {
            globals: globals.node,
        },
    },

    // Playwright specific config
    {
        files: ['e2e/**/*.{ts,js}'],
        ...playwright.configs['flat/recommended'],
    },
    {
        files: ['e2e/**/*.{ts,js}'],
        rules: {
            'playwright/expect-expect': 'error',
            'playwright/no-conditional-in-test': 'error',
            'playwright/no-focused-test': 'error',
            'playwright/no-force-option': 'warn',
            'playwright/no-page-pause': 'error',
            'playwright/no-skipped-test': 'error',
            'playwright/no-wait-for-timeout': 'error',
            'playwright/prefer-to-be': 'error',
            'playwright/prefer-to-have-count': 'error',
            'playwright/prefer-to-have-length': 'error',
        },
    },

    // General rule overrides
    {
        rules: {
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            'complexity': ['error', 10],
            'max-depth': ['error', 3],
            'max-lines': ['error', 300],
            'max-params': ['error', 4],
            'no-console': 'error',
        },
    },

    // Prettier
    /** @type {any} */ (eslintConfigPrettier),
];
