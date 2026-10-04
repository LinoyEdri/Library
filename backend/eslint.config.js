// ESM config: backend/package.json sets "type": "module".
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'coverage']),

  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      sourceType: 'module',
      globals: globals.node,
      parserOptions: {
        // Type-aware linting; files outside tsconfig (seed, prisma config) use the default project
        projectService: {
          allowDefaultProject: ['prisma/*.ts', '*.ts'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
