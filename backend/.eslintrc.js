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
  overrides: [
    {
      files: ['test/**', 'src/**/*.spec.ts'],
      extends: ['plugin:jest/recommended'],
      rules: {
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        'jest/unbound-method': 'error',
        'jest/expect-expect': [
          'error',
          {
            assertFunctionNames: [
              'expect',
              'request.**.expect',
              'agent[0-9]?.**.expect',
            ],
          },
        ],
        'jest/no-standalone-expect': [
          'error',
          {
            additionalTestBlockFunctions: ['afterEach', 'beforeAll'],
          },
        ],
      },
    },
  ],
  plugins: ['@typescript-eslint', 'jest', 'eslint-plugin-local-rules','@darraghor/nestjs-typed'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended',
    'plugin:@darraghor/nestjs-typed/recommended'
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    'prettier/prettier': ['error', require('./.prettierrc.json')],
    'local-rules/correct-logger-context': 'error',
    'local-rules/no-typeorm-equal': 'error',
    'func-style': ['error', 'declaration'],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_+$' },
    ],
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'no-return-await': 'off',
    '@typescript-eslint/return-await': ['error', 'always'],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'default',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'allow',
      },
      {
        selector: 'import',
        format: ['camelCase', 'PascalCase'],
      },
      {
        selector: 'enumMember',
        format: ['UPPER_CASE'],
      },
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'allow',
      },

      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
    ],
    // We have our own OpenApi decorator and don't directly use the one from NestJS
    '@darraghor/nestjs-typed/api-method-should-specify-api-response': 'off',
  },
};
