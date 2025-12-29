import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
    // Global ignores
    { ignores: ['_site/**', 'vendor/**', 'coverage/**', 'playwright-report/**', 'sw.js'] },

    // Base JS/TS configs
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.strict,
    ...tseslint.configs.stylistic,

    // Node.js config files
    {
        files: ['lighthouserc.js', 'lighthouserc.cjs', '*.config.js', '**/*.cjs'],
        languageOptions: {
            globals: {
                module: 'readonly',
                process: 'readonly',
                require: 'readonly',
                __dirname: 'readonly',
            },
        },
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-var-requires': 'off',
        },
    },

    // Playwright specific config - Strict testing rules
    {
        ...playwright.configs['flat/recommended'],
        files: ['e2e/**/*.{ts,js}'],
        rules: {
            ...playwright.configs['flat/recommended'].rules,
            'playwright/no-wait-for-timeout': 'error',
            'playwright/no-skipped-test': 'error',
            'playwright/no-focused-test': 'error',
            'playwright/no-conditional-in-test': 'error',
            'playwright/expect-expect': 'error',
            'playwright/no-force-option': 'warn',
            'playwright/no-page-pause': 'error',
            'playwright/prefer-to-be': 'error',
            'playwright/prefer-to-have-count': 'error',
            'playwright/prefer-to-have-length': 'error',
        },
    },

    // General rules customization
    {
        rules: {
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/consistent-type-imports': 'error',
        },
    },

    // Prettier must be last to override conflicting rules
    eslintConfigPrettier,
);
