export default {
    extends: ['stylelint-config-standard', 'stylelint-config-standard-scss'],
    rules: {
        'at-rule-no-unknown': null,
        'scss/at-rule-no-unknown': true,
        'no-descending-specificity': null,
        'selector-class-pattern': null,
        'custom-property-pattern': null,
    },
    ignoreFiles: ['_site/**', 'vendor/**', 'coverage/**', 'node_modules/**'],
};
