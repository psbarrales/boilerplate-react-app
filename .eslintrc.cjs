module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:react/recommended', 'eslint:recommended', 'plugin:storybook/recommended'],
  plugins: ['cucumber'],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
};
