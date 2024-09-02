/* SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 *  SPDX-License-Identifier: CC0-1.0
 */

import {
    includeIgnoreFile
} from "@eslint/compat";
import eslint from "@eslint/js";
import jest from "eslint-plugin-jest";
import localRules from "eslint-plugin-local-rules";
import eslintPluginPrettierRecommended
    from "eslint-plugin-prettier/recommended";

import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

export default tseslint.config(
  // typescript eslint default config + type checks
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
      languageOptions: {
          parserOptions: {
              projectService: true,
              tsconfigRootDir: __dirname
          }
      }
  },
  eslintPluginPrettierRecommended,
  // ignore files from .gitignore
  // https://eslint.org/docs/latest/use/configure/ignore#including-gitignore-files
  includeIgnoreFile(gitignorePath),
  { ignores: ["eslint.config.mjs"] },
  {
      plugins: {
          "local-rules": localRules
      }
  },
  // custom rules
  {
      rules: {
          "local-rules/correct-logger-context": "error",
          "local-rules/no-typeorm-equal": "error",
          "func-style": ["error", "declaration"],
          "@typescript-eslint/no-unused-vars": [
              "warn",
              { argsIgnorePattern: "^_+$" }
          ],
          "@typescript-eslint/explicit-function-return-type": "warn",
          "no-return-await": "off",
          "@typescript-eslint/return-await": ["error", "always"],
          "@typescript-eslint/naming-convention": [
              "error",
              {
                  selector: "default",
                  format: ["camelCase"],
                  leadingUnderscore: "allow",
                  trailingUnderscore: "allow"
              },
              {
                  selector: "import",
                  format: ["camelCase", "PascalCase"]
              },
              {
                  selector: "enumMember",
                  format: ["UPPER_CASE"]
              },
              {
                  selector: "variable",
                  format: ["camelCase", "UPPER_CASE"],
                  leadingUnderscore: "allow",
                  trailingUnderscore: "allow"
              },

              {
                  selector: "typeLike",
                  format: ["PascalCase"]
              }
          ],
          // We have our own OpenApi decorator and don't directly use the one from NestJS
          "@darraghor/nestjs-typed/api-method-should-specify-api-response": "off"
      }
  },

  {
      files: ["test/**", "src/**/*.spec.ts"],
      ...jest.configs["flat/recommended"],
      rules: {
          "@typescript-eslint/unbound-method": "off",
          "@typescript-eslint/no-unsafe-assignment": "off",
          "@typescript-eslint/no-unsafe-argument": "off",
          "@typescript-eslint/no-unsafe-member-access": "off",
          "@typescript-eslint/require-await": "off",
          "@typescript-eslint/explicit-function-return-type": "off",

          "jest/expect-expect": [
              "error",
              {
                  assertFunctionNames: [
                      "expect",
                      "request.**.expect",
                      "agent[0-9]?.**.expect"
                  ]
              }
          ],

          "jest/no-standalone-expect": [
              "error",
              {
                  additionalTestBlockFunctions: ["afterEach", "beforeAll"]
              }
          ]
      }
  }
);
