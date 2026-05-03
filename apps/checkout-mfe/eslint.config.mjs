import { defineConfig } from 'eslint/config';

const eslintConfig = defineConfig([
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {},
    ignores: ['dist/**', 'build/**', '**/*.spec.ts'],
  },
]);

export default eslintConfig;

