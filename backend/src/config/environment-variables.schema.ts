import { z } from 'zod';

// Env values are always strings, so "true"/"false" must be converted explicitly
const booleanFromString = z.enum(['true', 'false']).transform((value) => value === 'true');

// Shape and rules for every environment variable the backend reads
export const environmentVariablesSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive(),
  DB_NAME: z.string().min(1),
  DB_SCHEMA: z.string().min(1).default('public'),

  BACKEND_PORT: z.coerce.number().int().positive().default(3001),

  SEED_PASSWORD: z.string().min(8).default('Password123!'),
  ALLOW_DESTRUCTIVE_SEED: booleanFromString.default(false),

  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().min(1).default('1h'),

  CORS_ORIGIN: z.url(),
});

export type EnvironmentVariables = z.infer<typeof environmentVariablesSchema>;
