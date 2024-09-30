// https://eslint.org/docs/latest/use/migrate-to-9.0.0
// https://eslint.org/docs/latest/use/configure/migration-guide
// npx @eslint/migrate-config .eslintrc.js

const OFF = 0;

module.exports = {
    extends: '@yutengjing/eslint-config-react',
    rules: {
        'import/default': OFF,
        'react/prop-types': OFF,
    },
};
