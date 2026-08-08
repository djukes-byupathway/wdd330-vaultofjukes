import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["dist/**"],
  },

  js.configs.recommended,

  {
    files: ["src/**/*.{js,mjs}"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      globals: {
        ...globals.browser,
      },
    },

    rules: {
      "no-unused-vars": "warn",
      "no-console": "warn",
    },
  },
];
