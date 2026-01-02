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

        // Specificity rules (Strict: Error level)
        'no-descending-specificity': true,

        // Strict formatting rules
        'declaration-block-no-redundant-longhand-properties': true,
        'shorthand-property-no-redundant-values': true,
        'font-weight-notation': [
            'numeric',
            {
                ignore: ['relative'],
            },
        ],
        'color-function-notation': 'modern',
        'alpha-value-notation': 'percentage',
        'color-function-alias-notation': null,

        // Strict selector rules
        'selector-max-id': 0, // No IDs allows
        'selector-max-universal': 0, // No universal selector
        'selector-no-qualifying-type': true,
        'selector-max-compound-selectors': 3,
        'selector-max-specificity': '0,4,0',

        // Strict declaration rules
        'declaration-no-important': true,
        'max-nesting-depth': [2, { ignoreAtRules: ['media', 'supports', 'include'] }],

        // Prevent vendor prefixes (use autoprefixer instead)
        'property-no-vendor-prefix': true,
        'value-no-vendor-prefix': true,
        'selector-no-vendor-prefix': true,
        'media-feature-name-no-vendor-prefix': true,
        'at-rule-no-vendor-prefix': true,
    },
    reportDescriptionlessDisables: true,
    reportInvalidScopeDisables: true,
    reportNeedlessDisables: true,
    ignoreFiles: ['_site/**', 'vendor/**', 'coverage/**', 'node_modules/**'],
};
