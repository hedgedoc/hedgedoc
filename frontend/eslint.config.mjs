import { defineConfig } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import testingLibrary from "eslint-plugin-testing-library";
import jest from "eslint-plugin-jest";
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import prettierConfig from "./.prettierrc.json" with {type: "json"}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: compat.extends(
        "next/core-web-vitals",
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "prettier",
    ),

    plugins: {
        "@typescript-eslint": typescriptEslint,
        "testing-library": testingLibrary,
        jest,
        prettier,
    },

    languageOptions: {
        globals: {
            ...globals.jest,
            ...jest.environments.globals.globals,
        },

        ecmaVersion: 5,
        sourceType: "script",

        parserOptions: {
            tsconfigRootDir: ".",
            project: ["./tsconfig.json"],
        },
    },

    rules: {
        "prettier/prettier": ["error", prettierConfig],

        "no-use-before-define": "off",
        "no-debugger": "warn",
        "default-param-last": "off",

        "@typescript-eslint/consistent-type-imports": ["error", {
            prefer: "type-imports",
            disallowTypeAnnotations: false,
        }],

        "jest/no-disabled-tests": "warn",
        "jest/no-focused-tests": "error",
        "jest/no-identical-title": "error",
        "jest/prefer-to-have-length": "warn",
        "jest/valid-expect": "error",
    },
}, {
    files: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
    extends: compat.extends("plugin:testing-library/react"),
}]);
