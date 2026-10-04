import { defineConfig } from 'vitest/config';
import { INTEGRATION_TEST_DATABASE_NAME } from './src/test/setup/integration-test-database-name.ts';

export default defineConfig({
  test: {
    projects: [
      // Fast tests with mocked dependencies - no database needed
      {
        test: {
          name: 'unit',
          include: ['src/test/**/*.test.ts'],
          exclude: ['src/test/integration/**'],
        },
      },

      // HTTP tests through the real app and a real (separate) test database
      {
        test: {
          name: 'integration',
          include: ['src/test/integration/**/*.test.ts'],
          globalSetup: ['src/test/setup/prepare-integration-test-database.ts'],
          env: { DB_NAME: INTEGRATION_TEST_DATABASE_NAME },
          // Files share one database, so they must not run at the same time
          fileParallelism: false,
          testTimeout: 20000,
          hookTimeout: 60000,
        },
      },
    ],
  },
});
