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
  reportInvalidScopeDisables: true,
  reportNeedlessDisables: true,
  rules: {
    // Bleeding-edge strictest value notation
    'alpha-value-notation': 'percentage',

    // Bleeding-edge strictest quality rules (SCSS/AMP compatible)
    'annotation-no-unknown': [true, { ignoreAnnotations: ['default'] }],
    'at-rule-no-vendor-prefix': true,
    'color-function-notation': 'modern',
    'color-hex-length': 'short',
    'color-named': 'never', // NEW: No named colors (use hex/rgb)
    'color-no-invalid-hex': true,
    'comment-no-empty': true,
    'comment-word-disallowed-list': ['/^TODO/', '/^FIXME/'], // NEW: Disallow TODOs in production
    'custom-property-no-missing-var-function': true,

    // Bleeding-edge strictest patterns and naming
    'custom-property-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',
      { message: 'Expected custom property to be kebab-case' },
    ],
    'declaration-block-no-duplicate-custom-properties': true,
    'declaration-block-no-duplicate-properties': true,
    'declaration-block-no-redundant-longhand-properties': true,
    'declaration-block-no-shorthand-property-overrides': true,

    // Bleeding-edge strictest limits
    'declaration-block-single-line-max-declarations': 1,
    'declaration-no-important': true,
    'declaration-property-value-disallowed-list': {
      '/^border/': ['none'], // NEW: Use 0 instead of none
      '/^transition/': ['/all/'], // NEW: Specify transition properties
    },
    'font-family-name-quotes': 'always-where-recommended',
    'font-family-no-duplicate-names': true,
    'font-family-no-missing-generic-family-keyword': true,
    'font-weight-notation': ['numeric', { ignore: ['relative'] }],
    'function-calc-no-unspaced-operator': true,

    // Modern color notation enforcement (STRICTEST)
    'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla'], // NEW: Use modern color() or oklch()
    'function-linear-gradient-no-nonstandard-direction': true,
    'function-name-case': 'lower',
    'function-no-unknown': true,
    'function-url-no-scheme-relative': true,
    'function-url-quotes': 'always',
    'function-url-scheme-disallowed-list': ['data', 'ftp'], // NEW: Disallow inline data URIs

    'hue-degree-notation': 'angle',
    'import-notation': 'string',
    'keyframe-block-no-duplicate-selectors': true,
    'keyframe-declaration-no-important': true,
    'keyframe-selector-notation': 'percentage-unless-within-keyword-only-block',
    'keyframes-name-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',
      { message: 'Expected keyframe name to be kebab-case' },
    ],
    'length-zero-no-unit': [true, { ignore: ['custom-properties'] }],

    // STRICTEST nesting and complexity
    'max-nesting-depth': [
      2,
      { ignoreAtRules: ['media', 'supports', 'include'] },
    ],
    'media-feature-name-no-unknown': true,
    'media-feature-name-no-vendor-prefix': true,
    'media-feature-name-value-no-unknown': true,
    'media-feature-range-notation': 'prefix',
    'named-grid-areas-no-invalid': true,
    'no-descending-specificity': true,
    'no-duplicate-at-import-rules': true,
    'no-duplicate-selectors': true,
    'no-empty-source': true,
    'no-invalid-double-slash-comments': true,
    'no-invalid-position-at-import-rule': true,
    'no-irregular-whitespace': true,
    'no-unknown-animations': true,
    'number-max-precision': 3, // NEW: Reduced from 4 for stricter precision
    'property-no-unknown': true,
    'property-no-vendor-prefix': true,

    // Strictest value enforcement
    'scale-unlimited/declaration-strict-value': [
      ['/color/', 'font-size', 'font-family', 'z-index'], // NEW: Added z-index
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

    // STRICTEST selector rules
    'selector-attribute-quotes': 'always',
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$',
      { message: 'Expected class selector to be kebab-case (BEM allowed)' },
    ],
    'selector-id-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',
      { message: 'Expected id selector to be kebab-case' },
    ],
    'selector-max-attribute': 1,
    'selector-max-class': 3,
    'selector-max-combinators': 2, // NEW: Reduced from 3
    'selector-max-compound-selectors': 3,
    'selector-max-id': 0,
    'selector-max-pseudo-class': 2, // NEW: Reduced from 3
    'selector-max-specificity': '0,2,1', // NEW: Reduced from '0,3,1'
    'selector-max-type': 2, // NEW: Reduced from 3
    'selector-max-universal': 0,
    'selector-no-qualifying-type': true,
    'selector-no-vendor-prefix': true,
    'selector-not-notation': 'complex',
    'selector-pseudo-class-no-unknown': true,
    'selector-pseudo-element-colon-notation': 'double',
    'selector-pseudo-element-no-unknown': true,
    'selector-type-case': 'lower',
    'selector-type-no-unknown': [
      true,
      {
        ignore: ['custom-elements'],
        ignoreTypes: [
          '/^amp-/',
          'amp-img',
          'amp-video',
          'amp-animation',
          'amp-state',
          'amp-analytics',
          'amp-autocomplete',
          'amp-position-observer',
          'amp-install-serviceworker',
          'amp-mustache',
        ],
      },
    ],
    'shorthand-property-no-redundant-values': true,
    'string-no-newline': true,
    'time-min-milliseconds': 100,
    'unit-disallowed-list': ['cm', 'mm', 'in', 'pc', 'pt'], // NEW: Added pt
    'unit-no-unknown': true,
    'value-keyword-case': 'lower',
    'value-no-vendor-prefix': true,
  },
};
