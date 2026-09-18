// CommonJS syntax is required here: backend/package.json sets
// "type": "commonjs", so ESLint loads this file as CommonJS.
// (The frontend uses ESM syntax because its package is "type": "module".)
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      // TypeScript sources are authored with ESM import/export syntax,
      // even though tsc emits CommonJS.
      sourceType: 'module',
      globals: globals.node,
      parserOptions: {
        project: "./tsconfig.json",
        // Automatically sets the root to the current directory of the file
        tsconfigRootDir: __dirname, 
      }
    },
  },
]);
