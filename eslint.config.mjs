import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import configPrettier from 'eslint-config-prettier/flat';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/comparison/**',
    '**/bench/**',
    '**/publicsuffix/**',
    '**/bin/**/*.js',
    'eslint.config.mjs', // self: no typings for eslint/config deps in default project
  ]),
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            '*.cjs',
            '*.mjs',
            'packages/*/rollup.config.mjs',
          ],
        },
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Many array/index non-null assertions in trie and packed-hashes; keep off for now
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Allow numbers in template expressions (no explicit String() needed)
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],
    },
  },
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  configPrettier,
);
