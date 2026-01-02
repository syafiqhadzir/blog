import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import perfectionist from 'eslint-plugin-perfectionist';
import playwright from 'eslint-plugin-playwright';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    // Global ignores
    { ignores: ['_site/**', 'vendor/**', 'coverage/**', 'playwright-report/**', 'sw.js'] },

    // Base JS/TS configs
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.strict,
    ...tseslint.configs.stylistic,
    sonarjs.configs.recommended,
    unicorn.configs['flat/recommended'],
    perfectionist.configs['recommended-natural'],

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
            '@typescript-eslint/no-var-requires': 'off',
        },
    },

    // Browser files
    {
        files: ['assets/js/**/*.js'],
        languageOptions: {
            globals: globals.browser,
        },
    },

    // Playwright specific config - Strict testing rules
    {
        ...playwright.configs['flat/recommended'],
        files: ['e2e/**/*.{ts,js}'],
        rules: {
            ...playwright.configs['flat/recommended'].rules,
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

    // General rules customization
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

    // Prettier must be last to override conflicting rules
    eslintConfigPrettier,
);
