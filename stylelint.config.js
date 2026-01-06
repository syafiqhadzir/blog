export default {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-scss',
    'stylelint-config-recess-order',
  ],
  ignoreFiles: [
    '_site/**',
    'vendor/**',
    'coverage/**',
    'node_modules/**',
    '_includes/styles.scss',
  ],
  plugins: ['stylelint-declaration-strict-value'],
  reportDescriptionlessDisables: true,
  rules: {
    'alpha-value-notation': 'percentage',
    'at-rule-no-unknown': undefined,
    'at-rule-no-vendor-prefix': true,
    'color-function-notation': 'modern',
    // Allow comments without preceding blank lines (common in refactored files)
    'comment-empty-line-before': undefined,
    'custom-property-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',
      {
        message: 'Expected custom property to be kebab-case',
      },
    ],
    'declaration-block-no-redundant-longhand-properties': true,
    'declaration-no-important': true,
    'font-weight-notation': [
      'numeric',
      {
        ignore: ['relative'],
      },
    ],
    'function-url-quotes': 'always',
    // Strictest value rules
    'length-zero-no-unit': true,
    // Strictest selector rules
    'max-nesting-depth': [
      2,
      { ignoreAtRules: ['media', 'supports', 'include'] },
    ],
    'media-feature-name-no-vendor-prefix': true,
    // Use 'prefix' notation (max-width) for AMP compatibility instead of 'context' (width <=)
    'media-feature-range-notation': 'prefix',
    'no-empty-source': true,
    'no-unknown-animations': true,
    'number-max-precision': 4,
    'scale-unlimited/declaration-strict-value': [
      ['/color/', 'font-size', 'font-family'],
      {
        ignoreValues: [
          'inherit',
          'initial',
          'transparent',
          'none',
          'unset',
          0,
          '100%',
          String.raw`/var\(--.*\)/`,
          String.raw`/^-?[\d.]+(rem|em|vh|vw|px|%)$/`,
          'sans-serif',
          'serif',
          'monospace',
          'auto',
          'currentcolor',
        ],
      },
    ],
    'selector-max-compound-selectors': 3,
    'selector-max-id': 0,
    'selector-max-specificity': '0,3,0',
    'selector-max-universal': 0,
    'selector-no-qualifying-type': true,
    'selector-no-vendor-prefix': true,
    'shorthand-property-no-redundant-values': true,
    // Print styles may use pt for font sizes
    'unit-disallowed-list': ['cm', 'mm', 'in', 'pc'],
    'value-keyword-case': 'lower',
    'value-no-vendor-prefix': true,
  },
};
