import path from 'node:path';
import dotenv from 'dotenv';
import { EnvironmentConfigError } from '../types/errors/EnvironmentConfigError.ts';
import { environmentVariablesSchema } from './environment-variables.schema.ts';

// Backend root folder (src/config -> backend), so loading works from any working directory
const backendRootDirectory = path.resolve(import.meta.dirname, '../..');

// Tests read .env.test first; values missing there fall back to .env
const environmentFilePaths =
  process.env.NODE_ENV === 'test'
    ? [path.join(backendRootDirectory, '.env.test'), path.join(backendRootDirectory, '.env')]
    : [path.join(backendRootDirectory, '.env')];

dotenv.config({ path: environmentFilePaths, quiet: true });

const parsedEnvironment = environmentVariablesSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  const problems = parsedEnvironment.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');

  throw new EnvironmentConfigError(`Invalid environment variables - ${problems}`);
}

const environment = parsedEnvironment.data;

const nodeEnv = environment.NODE_ENV;
const seedPassword = environment.SEED_PASSWORD;
const allowDestructiveSeed = environment.ALLOW_DESTRUCTIVE_SEED;
const jwtSecret = environment.JWT_SECRET;
const jwtExpiresIn = environment.JWT_EXPIRES_IN;
const corsOrigin = environment.CORS_ORIGIN;
const simulateMessageDelivery = environment.SIMULATE_MESSAGE_DELIVERY;
const backendPort = environment.BACKEND_PORT;
const backendUrl = `http://localhost:${backendPort}`;

const databaseUrl =
  `postgresql://${encodeURIComponent(environment.DB_USER)}` +
  `:${encodeURIComponent(environment.DB_PASSWORD)}` +
  `@${environment.DB_HOST}:${environment.DB_PORT}/${encodeURIComponent(environment.DB_NAME)}` +
  `?schema=${encodeURIComponent(environment.DB_SCHEMA)}`;

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
  simulateMessageDelivery,
};
