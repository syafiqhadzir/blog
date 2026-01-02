/** @type {import('stylelint').Config} */
export default {
    extends: ['stylelint-config-standard', 'stylelint-config-standard-scss', 'stylelint-config-recess-order'],
    ignoreFiles: ['_site/**', 'vendor/**', 'coverage/**', 'node_modules/**'],
    plugins: ['stylelint-declaration-strict-value'],
    reportDescriptionlessDisables: true,
    reportInvalidScopeDisables: true,
    reportNeedlessDisables: true,
    rules: {
        'alpha-value-notation': 'percentage',
        // SCSS-specific rules
        'at-rule-no-unknown': undefined,

        'at-rule-no-vendor-prefix': true,
        'color-function-alias-notation': undefined,

        'color-function-notation': 'modern',

        'custom-property-pattern': [
            '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',
            {
                message: 'Expected custom property to be kebab-case',
            },
        ],
        // Strict formatting rules
        'declaration-block-no-redundant-longhand-properties': true,
        // Strict declaration rules
        'declaration-no-important': true,
        'font-weight-notation': [
            'numeric',
            {
                ignore: ['relative'],
            },
        ],
        'max-nesting-depth': [2, { ignoreAtRules: ['media', 'supports', 'include'] }],
        'media-feature-name-no-vendor-prefix': true,

        // Specificity rules (Strict: Error level)
        'no-descending-specificity': true,
        // Prevent vendor prefixes (use autoprefixer instead)
        'property-no-vendor-prefix': true,
        'scale-unlimited/declaration-strict-value': [
            ['/color/', 'font-family'],
            {
                ignoreValues: [
                    'inherit',
                    'transparent',
                    'initial',
                    'none',
                    'unset',
                    'currentColor',
                    'system-ui',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'Segoe UI',
                    'Roboto',
                    'Helvetica Neue',
                    'Arial',
                    'sans-serif',
                    'monospace',
                    'ui-monospace',
                    'SFMono-Regular',
                    'Consolas',
                    'Liberation Mono',
                    'Courier New',
                ],
            },
        ],
        'scss/at-rule-no-unknown': true,
        // Strict naming patterns
        'selector-class-pattern': [
            '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',
            {
                message: 'Expected class selector to be kebab-case',
            },
        ],

        'selector-max-compound-selectors': 3,
        // Strict selector rules
        'selector-max-id': 0, // No IDs allows

        'selector-max-specificity': '0,4,0',
        'selector-max-universal': 0, // No universal selector
        'selector-no-qualifying-type': true,
        'selector-no-vendor-prefix': true,
        'shorthand-property-no-redundant-values': true,
        'value-no-vendor-prefix': true,
    },
};
