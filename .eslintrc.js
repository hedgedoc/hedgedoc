/* SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 *  SPDX-License-Identifier: CC0-1.0
 */
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_+$' },
    ],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-return-await': 'off',
    '@typescript-eslint/return-await': ['error', 'always'],
  },
};
