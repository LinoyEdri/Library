import { EnvironmentConfigError } from "../types/errors/EnvironmentConfigError.ts";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const requireEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new EnvironmentConfigError(`Missing required environment variable: ${name}`);
  }

  return value;
};

const nodeEnv = process.env.NODE_ENV || 'development';
const dbUser = requireEnv('DB_USER');
const dbPassword = requireEnv('DB_PASSWORD');
const dbHost = requireEnv('DB_HOST');
const dbPort = requireEnv('DB_PORT');
const dbName = requireEnv('DB_NAME');
const dbSchema = process.env.DB_SCHEMA || 'public';
const seedPassword = process.env.SEED_PASSWORD || 'Password123!';
const allowDestructiveSeed = process.env.ALLOW_DESTRUCTIVE_SEED || true;
const jwtSecret = requireEnv('JWT_SECRET');
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
const corsOrigin = requireEnv('CORS_ORIGIN');

const databaseUrl =
  `postgresql://${encodeURIComponent(dbUser)}` +
  `:${encodeURIComponent(dbPassword)}` +
  `@${dbHost}:${dbPort}/${encodeURIComponent(dbName)}` +
  `?schema=${encodeURIComponent(dbSchema)}`;

const backendPort = process.env.BACKEND_PORT || '3001';
const backendUrl = `http://localhost:${backendPort}`;

export { 
  nodeEnv,
  databaseUrl, 
  backendUrl, 
  backendPort, 
  seedPassword, 
  allowDestructiveSeed, 
  jwtSecret, 
  jwtExpiresIn, 
  corsOrigin,
};
