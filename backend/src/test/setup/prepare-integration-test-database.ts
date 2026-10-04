import { execSync } from "node:child_process";
import path from "node:path";
import dotenv from "dotenv";
import pg from "pg";
import { INTEGRATION_TEST_DATABASE_NAME } from "./integration-test-database-name.ts";

// Vitest global setup: runs once before the integration tests.
// Creates the test database if it does not exist, then applies all Prisma migrations to it.
export default async function prepareIntegrationTestDatabase(): Promise<void> {
    const backendRootDirectory = path.resolve(import.meta.dirname, "../../..");

    dotenv.config({ path: path.join(backendRootDirectory, ".env"), quiet: true });

    const maintenanceConnection = new pg.Client({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: "postgres",
    });

    await maintenanceConnection.connect();

    const existingDatabase = await maintenanceConnection.query(
        "SELECT 1 FROM pg_database WHERE datname = $1",
        [INTEGRATION_TEST_DATABASE_NAME],
    );

    if (existingDatabase.rowCount === 0) {
        await maintenanceConnection.query(`CREATE DATABASE "${INTEGRATION_TEST_DATABASE_NAME}"`);
    }

    await maintenanceConnection.end();

    execSync("npx prisma migrate deploy", {
        cwd: backendRootDirectory,
        env: { ...process.env, NODE_ENV: "test", DB_NAME: INTEGRATION_TEST_DATABASE_NAME },
        stdio: "pipe",
    });
}
