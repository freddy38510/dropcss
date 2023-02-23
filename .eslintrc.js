const { defineConfig } = require('eslint-define-config');

module.exports = defineConfig({
  root: true,
  env: {
    node: true,
  },
  extends: ['airbnb-base', 'plugin:mocha/recommended', 'prettier'],
  plugins: ['mocha'],
  ignorePatterns: ['node_modules', 'dist', 'test/bench/stress'],
  rules: {
    'no-param-reassign': 'off',
    'no-cond-assign': ['error', 'except-parens'],
    'prefer-arrow-callback': 0,
    'mocha/prefer-arrow-callback': 2,
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['.eslintrc.js', './*', 'test/**'] }, // eslint config file, files at root and test folder
    ],
  },
  overrides: [
    {
      files: ['demos/**'],
      env: {
        node: true,
        browser: true,
      },
    },
  ],
});
