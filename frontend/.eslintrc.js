/**
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: CC0-1.0
 **/
module.exports = {
  "root": true,
  "parserOptions": {
    "tsconfigRootDir": ".",
    "project": [
      "./tsconfig.json"
    ]
  },
  "rules": {
    "prettier/prettier": ["error",
      require('./.prettierrc.json')
    ],
    "no-use-before-define": "off",
    "no-debugger": "warn",
    "default-param-last": "off",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        "prefer": "type-imports",
        "disallowTypeAnnotations": false
      }
    ],
    "jest/no-disabled-tests": "warn",
    "jest/no-focused-tests": "error",
    "jest/no-identical-title": "error",
    "jest/prefer-to-have-length": "warn",
    "jest/valid-expect": "error"
  },
  "env": {
    "jest": true,
    "jest/globals": true
  },
  "plugins": [
    "@typescript-eslint",
    "testing-library",
    "jest",
    "prettier"
  ],
  "extends": [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "overrides": [
    {
      "files": [
        "**/__tests__/**/*.[jt]s?(x)",
        "**/?(*.)+(spec|test).[jt]s?(x)"
      ],
      "extends": ["plugin:testing-library/react"]
    }
  ]
}
