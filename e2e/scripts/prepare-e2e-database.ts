import { execSync } from 'node:child_process';
import pg from 'pg';
import { BACKEND_DIRECTORY, E2E_DATABASE_NAME } from '../e2e-environment.ts';

// Runs before the E2E backend starts: creates the library_e2e database if needed, applies every
// migration and loads the seed, so each run starts from the same known data.
// Refuses to touch any database other than library_e2e.

if (process.env.DB_NAME !== E2E_DATABASE_NAME) {
  throw new Error(
    `Refusing to prepare "${process.env.DB_NAME}" - E2E only uses ${E2E_DATABASE_NAME}`,
  );
}

const maintenanceConnection = new pg.Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'postgres',
});

await maintenanceConnection.connect();

const existingDatabase = await maintenanceConnection.query(
  'SELECT 1 FROM pg_database WHERE datname = $1',
  [E2E_DATABASE_NAME],
);

if (existingDatabase.rowCount === 0) {
  await maintenanceConnection.query(`CREATE DATABASE "${E2E_DATABASE_NAME}"`);
}

await maintenanceConnection.end();

const backendCommandOptions = {
  cwd: BACKEND_DIRECTORY,
  stdio: 'inherit',
  env: { ...process.env, ALLOW_DESTRUCTIVE_SEED: 'true' },
} as const;

execSync('npx prisma migrate deploy', backendCommandOptions);

execSync('npx tsx prisma/seed.ts', backendCommandOptions);
