// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    files: ["__tests__/**/*.js"],
    languageOptions: {
      globals: {
        beforeEach: "readonly",
        describe: "readonly",
        expect: "readonly",
        jest: "readonly",
        test: "readonly",
      },
    },
  },
  {
    ignores: ["dist/*"],
  }
]);
