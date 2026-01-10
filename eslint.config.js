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

  // General Rules - MODERN INDUSTRIAL STANDARD
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
      // Modern Complexity (Industrial balance)
      complexity: ['error', 10], // Balanced for maintainability
      'max-depth': ['error', 3], // Reasonable nesting
      'max-lines': ['error', 250], // Practical file size
      'max-lines-per-function': ['error', 75], // Adequate for logic
      'max-nested-callbacks': ['error', 3], // Prevent callback hell
      'max-params': ['error', 4], // Balanced parameter count
      'max-statements': ['error', 25], // Reasonable function complexity

      // Modern JavaScript - NO DEPRECATED SYNTAX
      'no-var': 'error', // Enforce const/let
      'prefer-const': 'error', // Immutability by default
      'prefer-arrow-callback': 'error', // Modern function syntax
      'prefer-template': 'error', // Template literals
      'prefer-destructuring': ['error', { object: true, array: false }],
      'prefer-rest-params': 'error', // Rest over arguments
      'prefer-spread': 'error', // Spread over apply
      'object-shorthand': ['error', 'always'], // ES6 object notation
      'prefer-numeric-literals': 'error', // Modern number syntax
      'prefer-object-spread': 'error', // Object spread over assign
      'prefer-promise-reject-errors': 'error', // Proper error handling

      // Code Quality (Industrial standard)
      'no-console': 'warn', // Warn instead of error for debugging
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-magic-numbers': [
        'error',
        {
          ignore: [0, 1, -1, 2],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          enforceConst: true,
        },
      ],

      // Control Flow (Modern best practices)
      'no-else-return': ['error', { allowElseIf: false }],
      'no-lonely-if': 'error',
      'no-unneeded-ternary': 'error',
      'no-negated-condition': 'error',
      'no-nested-ternary': 'error',
      yoda: ['error', 'never'],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      curly: ['error', 'all'],

      // Error Prevention
      'no-await-in-loop': 'warn', // Performance consideration
      'no-promise-executor-function': 'error',
      'no-return-await': 'error',
      'require-atomic-updates': 'error',

      // SonarJS (Balanced cognitive complexity)
      'sonarjs/cognitive-complexity': ['error', 12], // Practical limit
      'sonarjs/no-duplicate-string': ['error', { threshold: 5 }], // DRY principle
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-small-switch': 'off', // Allow small switches

      // Unicorn (Modern JavaScript patterns)
      'unicorn/consistent-function-scoping': 'error',
      'unicorn/no-null': 'off', // null is sometimes needed
      'unicorn/numeric-separators-style': 'error',
      'unicorn/prefer-module': 'error',
      'unicorn/prefer-ternary': 'warn', // Warn instead of error
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
            e2e: true,
          },
        },
      ],
      'unicorn/prefer-array-some': 'error',
      'unicorn/prefer-date-now': 'error',
      'unicorn/prefer-default-parameters': 'error',
      'unicorn/prefer-number-properties': 'error',
      'unicorn/prefer-string-slice': 'error',
      'unicorn/throw-new-error': 'error',
      'unicorn/no-array-callback-reference': 'off', // Too strict
      'unicorn/no-array-for-each': 'off', // forEach is acceptable
    },
  },

  // TypeScript - MODERN TYPE-SAFE STANDARDS
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
      // Modern TypeScript (Essential type safety)
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'warn', // Warn for flexibility
        { allowExpressions: true, allowTypedFunctionExpressions: true },
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

      // Type Safety (Critical rules)
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Modern TypeScript patterns
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-readonly': 'warn',
      '@typescript-eslint/prefer-reduce-type-parameter': 'error',
      '@typescript-eslint/prefer-return-this-type': 'error',
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/restrict-plus-operands': 'error',
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
        },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',

      // Enhanced safety
      '@typescript-eslint/no-base-to-string': 'error',
      '@typescript-eslint/no-confusing-non-null-assertion': 'error',
      '@typescript-eslint/no-duplicate-type-constituents': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/prefer-enum-initializers': 'error',
      '@typescript-eslint/prefer-literal-enum-member': 'error',
      '@typescript-eslint/prefer-regexp-exec': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    },
  },

  // Playwright Tests (Balanced rules for testing)
  {
    ...playwright.configs['flat/recommended'],
    files: ['{e2e,tests}/**/*.{ts,js}'],
    rules: {
      complexity: ['error', 15], // Tests can be more complex
      'max-lines': ['error', 400],
      'max-lines-per-function': 'off',
      'max-params': ['error', 5],
      'max-statements': 'off',
      'no-magic-numbers': 'off',
      'playwright/expect-expect': 'error',
      'playwright/no-conditional-in-test': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/no-skipped-test': 'warn',
      'playwright/no-wait-for-timeout': 'error',
      'playwright/prefer-to-be': 'error',
      'playwright/prefer-to-have-count': 'error',
      'playwright/prefer-to-have-length': 'error',
    },
  },

  // Config/Scripts (Relaxed for tooling)
  {
    files: ['*.config.js', '*.config.ts', 'scripts/*.js', 'lighthouse/**/*.js'],
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

  // CJS Files (CommonJS support)
  {
    files: ['**/*.cjs'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'no-console': 'off',
      'no-magic-numbers': 'off',
      'unicorn/prefer-module': 'off',
    },
  },

  // Browser Scripts (Service Worker, etc)
  {
    files: ['assets/js/**/*.js', 'sw-source.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
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
