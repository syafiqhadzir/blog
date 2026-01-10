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

  // General Rules - BLEEDING-EDGE STRICTEST
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker,
      },
      sourceType: 'module',
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      // Bleeding-edge complexity limits (STRICTEST)
      complexity: ['error', 6], // Reduced from 8
      eqeqeq: ['error', 'always'], // NEW: Strict equality
      'max-depth': ['error', 2], // Reduced from 3
      'max-lines': ['error', 150], // Reduced from 200
      'max-lines-per-function': ['error', 50], // Reduced from 60
      'max-nested-callbacks': ['error', 2], // Reduced from 3
      'max-params': ['error', 3],

      'max-statements': ['error', 15], // Reduced from 20
      // Strictest code quality
      'no-alert': 'error',
      'no-console': 'error',
      'no-debugger': 'error',
      'no-else-return': 'error', // NEW: Simplify control flow
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-lonely-if': 'error', // NEW: Simplify nested conditions
      'no-magic-numbers': [
        'error',
        {
          ignore: [0, 1, -1], // Reduced from [0, 1, 2]
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
        },
      ],
      'no-unneeded-ternary': 'error', // NEW: Simplify ternaries
      'no-var': 'error',
      'object-shorthand': ['error', 'always'], // NEW: Modern object syntax
      'prefer-arrow-callback': 'error', // NEW: Arrow functions
      'prefer-const': 'error',
      'prefer-destructuring': ['error', { array: false, object: true }], // NEW: Destructuring
      'prefer-rest-params': 'error', // NEW: Rest params over arguments
      'prefer-spread': 'error', // NEW: Spread over apply
      'prefer-template': 'error', // NEW: Enforce template literals
      // SonarJS bleeding-edge (STRICTEST)
      'sonarjs/cognitive-complexity': ['error', 8], // Reduced from 10

      'sonarjs/no-duplicate-string': ['error', { threshold: 3 }], // NEW: Stricter DRY
      'sonarjs/no-identical-functions': 'error', // NEW: Detect duplicates
      // Unicorn strict (ENHANCED)
      'unicorn/consistent-function-scoping': 'error',

      'unicorn/no-null': 'error',
      'unicorn/numeric-separators-style': 'error',
      'unicorn/prefer-array-some': 'error', // NEW
      'unicorn/prefer-date-now': 'error', // NEW
      'unicorn/prefer-default-parameters': 'error', // NEW
      'unicorn/prefer-module': 'error',
      'unicorn/prefer-number-properties': 'error', // NEW
      'unicorn/prefer-string-slice': 'error', // NEW
      'unicorn/prefer-ternary': 'error',
      'unicorn/prefer-top-level-await': 'error',
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
      'unicorn/throw-new-error': 'error', // NEW
      yoda: 'error', // NEW: No Yoda conditions
    },
  },

  // TypeScript - BLEEDING-EDGE STRICTEST
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Enable bleeding-edge strictest TypeScript rules
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        { format: ['camelCase'], selector: 'default' },
        { format: ['camelCase', 'UPPER_CASE'], selector: 'variable' },
        { format: ['PascalCase'], selector: 'typeLike' },
        { format: ['camelCase', 'PascalCase'], selector: 'import' },
        {
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          selector: 'parameter',
        },
      ],
      // NEW STRICTEST RULES
      '@typescript-eslint/no-base-to-string': 'error',
      '@typescript-eslint/no-confusing-non-null-assertion': 'error',
      '@typescript-eslint/no-confusing-void-expression': 'error',
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/no-duplicate-type-constituents': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-meaningless-void-operator': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-mixed-enums': 'error',
      '@typescript-eslint/no-redundant-type-constituents': 'error',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-useless-empty-export': 'error',
      '@typescript-eslint/prefer-enum-initializers': 'error',
      '@typescript-eslint/prefer-literal-enum-member': 'error',

      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off', // Too strict for practical use
      '@typescript-eslint/prefer-reduce-type-parameter': 'error',
      '@typescript-eslint/prefer-regexp-exec': 'error',
      '@typescript-eslint/prefer-return-this-type': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/restrict-plus-operands': 'error',
      '@typescript-eslint/restrict-template-expressions': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
    },
  },

  // Playwright
  {
    ...playwright.configs['flat/recommended'],
    files: ['{e2e,tests}/**/*.{ts,js}'],
    rules: {
      complexity: ['error', 10], // Reduced from 12
      'max-lines': ['error', 300], // Reduced from 400
      'max-lines-per-function': 'off',
      'max-params': ['error', 5],
      'max-statements': 'off',
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

  // Config/Scripts
  {
    files: ['lighthouserc.js', '*.config.js', 'scripts/*.js'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'max-statements': 'off',
      'no-console': 'off',
      'no-magic-numbers': 'off',
      'unicorn/no-process-exit': 'off',
    },
  },

  // CJS Files Only (strict CommonJS isolation)
  {
    files: ['**/*.cjs', 'lighthouserc.cjs'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'max-statements': 'off',
      'no-console': 'off',
      'no-magic-numbers': 'off',
      'unicorn/no-process-exit': 'off',
      'unicorn/prefer-module': 'off',
    },
  },

  // Browser
  {
    files: ['assets/js/**/*.js', 'sw-source.js', 'playwright.config.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker,
      },
    },
    rules: {
      'max-lines-per-function': 'off',
      'max-statements': 'off',
      'no-magic-numbers': 'off',
    },
  },

  // Prettier (must be last)
  /** @type {any} */ (eslintConfigPrettier),
);
