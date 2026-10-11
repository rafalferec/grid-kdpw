import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import boundaries from 'eslint-plugin-boundaries';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const rootPath = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig([
  globalIgnores(['dist/**', 'coverage/**']),
  {
    files: ['**/*.{js,ts,tsx}'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/ban-ts-comment': ['error', {
        'ts-ignore': true,
        'ts-nocheck': true,
        'ts-check': false,
        'ts-expect-error': 'allow-with-description',
      }],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: { globals: globals.browser },
    plugins: { boundaries },
    settings: {
      'boundaries/root-path': rootPath,
      'boundaries/files': [
        { category: 'entry', pattern: 'src/main.tsx' },
        { category: 'declarations', pattern: 'src/vite-env.d.ts' },
        { category: 'test', pattern: 'src/**/*.test.{ts,tsx}' },
        { category: 'test-support', pattern: 'tests/server.ts' },
      ],
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app' },
        { type: 'feature', pattern: 'src/features/*', capture: ['name'] },
        { type: 'shared', pattern: 'src/shared' },
        { type: 'styles', pattern: 'src/styles' },
      ],
      'import/resolver': {
        typescript: { project: './tsconfig.app.json' },
      },
    },
    rules: {
      'boundaries/no-unknown-files': 'error',
      'boundaries/no-unknown-dependencies': 'error',
      'boundaries/dependencies': ['error', {
        default: 'disallow',
        policies: [
          {
            from: { file: { categories: 'test' } },
            allow: { to: { file: { categories: 'test-support' } } },
          },
          {
            from: { file: { categories: 'entry' } },
            allow: { to: { element: { type: ['app', 'styles'] } } },
          },
          {
            from: { element: { type: 'app' } },
            allow: { to: [
              { element: { type: 'shared' } },
              { element: { type: 'feature', fileInternalPath: 'index.ts' } },
            ] },
          },
          {
            from: { element: { type: 'feature' } },
            allow: { to: { element: { type: 'shared' } } },
          },
        ],
      }],
    },
  },
  {
    files: [
      'src/shared/components/GridWrapper/**/*.{ts,tsx}',
      'src/shared/hooks/useServerGridState*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@reduxjs/toolkit', '@reduxjs/toolkit/**', '@/shared/api', '@/shared/api/**', '**/api', '**/api/**'],
          message: 'Generyczna prezentacja i stan UI nie mogą zależeć od transportu API.',
        }],
      }],
    },
  },
]);
