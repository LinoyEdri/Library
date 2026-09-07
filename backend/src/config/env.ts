const required = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const dbUser = required("DB_USER");
const dbPassword = required("DB_PASSWORD");
const dbHost = required("DB_HOST");
const dbPort = required("DB_PORT");
const dbName = required("DB_NAME");
const dbSchema = process.env.DB_SCHEMA || "public";

const databaseUrl =
  `postgresql://${encodeURIComponent(dbUser)}` +
  `:${encodeURIComponent(dbPassword)}` +
  `@${dbHost}:${dbPort}/${encodeURIComponent(dbName)}` +
  `?schema=${encodeURIComponent(dbSchema)}`;

const backendPort = process.env.BACKEND_PORT || "3001";
const backendUrl = `http://localhost:${backendPort}`;

export {databaseUrl, backendUrl, backendPort};