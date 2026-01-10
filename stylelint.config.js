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
    // Modern Value Notation (CSS3+)
    'alpha-value-notation': 'percentage',
    'color-function-notation': 'modern',
    'color-hex-length': 'short',
    'hue-degree-notation': 'angle',
    'font-weight-notation': ['numeric', { ignore: ['relative'] }],

    // Deprecated Syntax - BANNED
    'function-disallowed-list': ['rgb', 'rgba'], // Use modern color() or oklch()
    'unit-disallowed-list': ['cm', 'mm', 'in', 'pc', 'pt'], // Screen-only units

    // Quality Rules (Industrial standard)
    'at-rule-no-vendor-prefix': true,
    'color-no-invalid-hex': true,
    'comment-no-empty': true,
    'custom-property-no-missing-var-function': true,
    'declaration-block-no-duplicate-custom-properties': true,
    'declaration-block-no-duplicate-properties': true,
    'declaration-block-no-redundant-longhand-properties': true,
    'declaration-block-no-shorthand-property-overrides': true,
    'font-family-name-quotes': 'always-where-recommended',
    'font-family-no-duplicate-names': true,
    'font-family-no-missing-generic-family-keyword': true,
    'function-calc-no-unspaced-operator': true,
    'function-linear-gradient-no-nonstandard-direction': true,
    'function-name-case': 'lower',
    'function-no-unknown': true,
    'function-url-no-scheme-relative': true,
    'function-url-quotes': 'always',
    'import-notation': 'string',
    'keyframe-block-no-duplicate-selectors': true,
    'keyframe-declaration-no-important': true,
    'keyframe-selector-notation': 'percentage-unless-within-keyword-only-block',
    'length-zero-no-unit': [true, { ignore: ['custom-properties'] }],
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
    'property-no-unknown': true,
    'property-no-vendor-prefix': true,
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
    'unit-no-unknown': true,
    'value-keyword-case': 'lower',
    'value-no-vendor-prefix': true,

    // Modern Patterns (Industrial balance)
    'custom-property-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',
      { message: 'Expected custom property to be kebab-case' },
    ],
    'keyframes-name-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',
      { message: 'Expected keyframe name to be kebab-case' },
    ],
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$',
      { message: 'Expected class selector to be kebab-case (BEM allowed)' },
    ],
    'selector-id-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',
      { message: 'Expected id selector to be kebab-case' },
    ],

    // Complexity Limits (Industrial standard)
    'declaration-block-single-line-max-declarations': 1,
    'max-nesting-depth': [
      3, // Practical for real-world SCSS
      { ignoreAtRules: ['media', 'supports', 'include'] },
    ],
    'number-max-precision': 4,
    'selector-max-attribute': 2,
    'selector-max-class': 4, // Practical for BEM
    'selector-max-combinators': 3,
    'selector-max-compound-selectors': 4,
    'selector-max-id': 0,
    'selector-max-pseudo-class': 3,
    'selector-max-specificity': '0,4,1', // Balanced for modern CSS
    'selector-max-type': 2,
    'selector-max-universal': 0,
    'time-min-milliseconds': 100,

    // Best Practices (Not overly strict)
    'declaration-no-important': true,
    'selector-attribute-quotes': 'always',
    'selector-no-qualifying-type': true,
    'selector-no-vendor-prefix': true,
    'selector-not-notation': 'complex',

    // Strict Value Enforcement (Core variables only)
    'scale-unlimited/declaration-strict-value': [
      ['/color/', 'z-index'], // Only colors and z-index
      {
        ignoreValues: [
          'inherit',
          'initial',
          'transparent',
          'none',
          'unset',
          'currentcolor',
          0,
          '100%',
          String.raw`/var\(--.*\)/`,
          String.raw`/^-?[\d.]+(rem|em|vh|vw|px|%)$/`,
        ],
      },
    ],

    // Annotation Control (Allow common patterns)
    'annotation-no-unknown': [true, { ignoreAnnotations: ['default'] }],
  },
};
