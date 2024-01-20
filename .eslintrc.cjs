module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'import/prefer-default-export': 0,
    'no-console': 0,
    'object-shorthand': 1,
    'no-underscore-dangle': 0,
    'linebreak-style': 0,
    'import/no-cycle': 0,
    'lines-between-class-members': 0,
    'no-mixed-operators': 0,
    'import/extensions': 0,
    quotes: 0,
  },
};
