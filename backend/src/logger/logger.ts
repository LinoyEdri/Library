import pino from 'pino';

// Check if we are running in a local development environment
const isDevelopment = process.env.NODE_ENV == 'development';

export const logger = pino({
  // Minimum level to log. Anything below this level will be ignored.
  level: isDevelopment ? 'trace' : 'info',

  // Format logs for humans during development
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname', // Removes cluttering metadata from terminal
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
        },
      }
    : undefined, // Defaults to ultra-fast JSON strings in production
});
