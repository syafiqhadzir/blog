/** @type {import('stylelint').Config} */
export default {
    extends: ['stylelint-config-standard', 'stylelint-config-standard-scss'],
    rules: {
        // SCSS-specific rules
        'at-rule-no-unknown': null,
        'scss/at-rule-no-unknown': true,

        // Strict naming patterns
        'selector-class-pattern': [
            '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',
            {
                message: 'Expected class selector to be kebab-case',
            },
        ],
        'custom-property-pattern': [
            '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',
            {
                message: 'Expected custom property to be kebab-case',
            },
        ],

        // Specificity rules (warning level for gradual adoption)
        'no-descending-specificity': [true, { severity: 'warning' }],

        // Strict formatting rules
        'declaration-block-no-redundant-longhand-properties': true,
        'shorthand-property-no-redundant-values': true,
        'font-weight-notation': 'numeric',
        'color-function-notation': 'modern',
        'alpha-value-notation': 'percentage',

        // Strict selector rules
        'selector-max-id': 1,
        'selector-max-universal': 1,
        'selector-no-qualifying-type': [true, { ignore: ['attribute'] }],

        // Strict declaration rules
        'declaration-no-important': [true, { severity: 'warning' }],
        'max-nesting-depth': [3, { ignoreAtRules: ['media', 'supports', 'include'] }],

        // Prevent vendor prefixes (use autoprefixer instead)
        'property-no-vendor-prefix': true,
        'value-no-vendor-prefix': true,
        'selector-no-vendor-prefix': true,
        'media-feature-name-no-vendor-prefix': true,
        'at-rule-no-vendor-prefix': true,
    },
    ignoreFiles: ['_site/**', 'vendor/**', 'coverage/**', 'node_modules/**'],
};
