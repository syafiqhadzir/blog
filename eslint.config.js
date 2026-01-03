// @ts-check
import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import perfectionist from 'eslint-plugin-perfectionist';
import playwright from 'eslint-plugin-playwright';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
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
  js.configs.recommended,
  /** @type {any} */ (sonarjs.configs.recommended),
  /** @type {any} */ (unicorn.configs.recommended),
  /** @type {any} */ (perfectionist.configs['recommended-natural']),

  // General Rules (Non-type-checked)
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker,
      },
    },
    rules: {
      complexity: ['error', 8],
      'max-depth': ['error', 3],
      'max-lines': ['error', 200],
      'max-params': ['error', 3],
      'no-console': 'error',
      'no-magic-numbers': [
        'error',
        {
          ignore: [0, 1, 2, 3, 5, 8, 10, 12, 15, 200, 400],
          ignoreArrayIndexes: true,
        },
      ],
      'unicorn/consistent-function-scoping': 'error',
      'unicorn/no-null': 'error',
      'unicorn/numeric-separators-style': 'error',
      'unicorn/prefer-module': 'error',
      'unicorn/prefer-ternary': 'error',
      'unicorn/prevent-abbreviations': [
        'error',
        {
          allowList: {
            args: true,
            db: true,
            doc: true,
            env: true,
            err: true,
            fm: true,
            params: true,
            props: true,
            ref: true,
            req: true,
            res: true,
          },
        },
      ],
      'unicorn/switch-case-braces': 'error',
    },
  },

  // TypeScript Only Rules (Type-checked)
  {
    extends: [
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          format: ['camelCase'],
          selector: 'default',
        },
        {
          format: ['camelCase', 'UPPER_CASE'],
          selector: 'variable',
        },
        {
          format: ['PascalCase'],
          selector: 'typeLike',
        },
        {
          format: ['camelCase', 'PascalCase'],
          selector: 'import',
        },
        {
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          selector: 'parameter',
        },
        {
          format: null, // eslint-disable-line unicorn/no-null
          selector: 'objectLiteralProperty',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/prefer-readonly': 'error',
    },
  },

  // Playwright
  {
    files: ['{e2e,tests}/**/*.{ts,js}'],
    ...playwright.configs['flat/recommended'],
    rules: {
      complexity: ['error', 15],
      'max-lines': ['error', 400],
      'max-params': ['error', 5],
      'no-magic-numbers': 'off',
      'playwright/expect-expect': 'error',
      'playwright/no-conditional-in-test': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/no-skipped-test': 'error',
      'playwright/no-wait-for-timeout': 'error',
      'playwright/prefer-to-be': 'error',
      'playwright/prefer-to-have-count': 'error',
      'playwright/prefer-to-have-length': 'error',
    },
  },

  // Node.js globals for config/scripts
  {
    files: [
      'lighthouserc.js',
      'lighthouserc.cjs',
      '*.config.js',
      '**/*.cjs',
      'scripts/*.js',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'max-lines': 'off',
    },
  },

  // Browser files - disable type-checked for legacy assets
  {
    files: ['assets/js/**/*.js', 'sw-source.js', 'playwright.config.ts'],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
        ...globals.node,
      },
    },
    rules: {
      'no-magic-numbers': 'off',
    },
  },

  // Prettier must be last
  /** @type {any} */ (eslintConfigPrettier),
);
