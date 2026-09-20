import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Providers export hooks + components from the same file.
      'react-refresh/only-export-components': 'off',
      // Form hydration / sync patterns used across store + catalog.
      'react-hooks/set-state-in-effect': 'off',
      // useAsync takes caller-controlled dependency arrays.
      'react-hooks/use-memo': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]);
