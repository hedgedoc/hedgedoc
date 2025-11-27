// SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
//
// SPDX-License-Identifier: AGPL-3.0-only


module.exports = {
  plugins: ['@typescript-eslint', 'jest', 'testing-library'],
  env: {
    browser: true,
    node: true,
    jest: true
  },
  extends: ['eslint:recommended', 'next', 'next/core-web-vitals', 'prettier'],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }
    ]
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
      },
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking'
      ]
    }
  ]
}
