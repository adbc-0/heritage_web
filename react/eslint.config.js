import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default defineConfig([
    globalIgnores(["dist"]),
    {
        settings: { react: { version: "19.2.0" } },
        extends: [
            js.configs.recommended,
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.stylisticTypeChecked,
        ],
        // https://eslint.org/docs/latest/use/configure/configuration-files
        // By default, ESLint lints files that match the patterns **/*.js, **/*.cjs, and **/*.mjs.
        // Those files are always matched unless you explicitly exclude them using global ignores.
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            globals: globals.browser,
            // https://typescript-eslint.io/getting-started/typed-linting/
            // Some typescript-eslint rules utilize TypeScript's type checking APIs to provide much deeper insights into your code.
            // This requires TypeScript to analyze your entire project instead of just the file being linted.
            // As a result, these rules are slower than traditional lint rules but are much more powerful.
            parserOptions: {
                projectService: true,
            },
        },
        plugins: {
            react,
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh, // Validate that your components can safely be updated with Fast Refresh
            "jsx-a11y": jsxA11y,
        },
        rules: {
            ...react.configs.recommended.rules,
            ...react.configs["jsx-runtime"].rules,
            ...reactHooks.configs.recommended.rules,
            ...jsxA11y.configs.recommended.rules,
            "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
            "@typescript-eslint/consistent-type-definitions": "off",
            "@typescript-eslint/no-unnecessary-condition": "off",
            "react/prop-types": "off",
            ...prettier.rules,
        },
    },
]);
