import path from 'node:path';
import dotenv from 'dotenv';

// The backend's .env holds the database login and the seed password (never overrides set values)
export const BACKEND_DIRECTORY = path.resolve(import.meta.dirname, '../backend');

dotenv.config({ path: path.join(BACKEND_DIRECTORY, '.env'), quiet: true });

// E2E runs against its own database and ports, so the dev database and dev servers are untouched
export const E2E_DATABASE_NAME = 'library_e2e';

export const E2E_BACKEND_PORT = 3101;

export const E2E_FRONTEND_PORT = 3100;

export const E2E_FRONTEND_URL = `http://localhost:${E2E_FRONTEND_PORT}`;

// Every seeded account logs in with this password (same default as the backend env schema)
export const SEED_PASSWORD = process.env.SEED_PASSWORD ?? 'Password123!';
