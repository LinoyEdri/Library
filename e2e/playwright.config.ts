import { defineConfig, devices } from '@playwright/test';
import {
  E2E_BACKEND_PORT,
  E2E_DATABASE_NAME,
  E2E_FRONTEND_PORT,
  E2E_FRONTEND_URL,
} from './e2e-environment.ts';

// Browser tests per role against a freshly seeded library_e2e database.
// The backend (3101) and frontend (3100) start automatically on their own ports.
export default defineConfig({
  testDir: './tests',

  // One shared seeded database: tests run one at a time, in file order
  fullyParallel: false,
  workers: 1,

  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },

  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: E2E_FRONTEND_URL,
    locale: 'he-IL',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  webServer: [
    {
      // Prepares (creates, migrates, seeds) the E2E database, then starts the API on it
      command: 'npx tsx ../e2e/scripts/prepare-e2e-database.ts && npx tsx src/server.ts',
      cwd: '../backend',
      url: `http://localhost:${E2E_BACKEND_PORT}/api/health`,
      reuseExistingServer: false,
      timeout: 180_000,
      env: {
        NODE_ENV: 'development',
        DB_NAME: E2E_DATABASE_NAME,
        BACKEND_PORT: String(E2E_BACKEND_PORT),
        CORS_ORIGIN: E2E_FRONTEND_URL,
        SIMULATE_MESSAGE_DELIVERY: 'true',
      },
    },
    {
      command: `npx vite --port ${E2E_FRONTEND_PORT} --strictPort`,
      cwd: '../frontend',
      url: E2E_FRONTEND_URL,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        VITE_API_PROXY_TARGET: `http://localhost:${E2E_BACKEND_PORT}`,
      },
    },
  ],
});
