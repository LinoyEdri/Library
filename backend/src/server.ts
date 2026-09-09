// backend/src/server.ts
import express from 'express';
import prisma from './prisma/prisma.ts'; // Import your custom client
import { backendPort, backendUrl } from './config/env.ts';
import { logger } from './logger/logger.ts';

const app = express();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const server = app.listen(backendPort, () => {
  logger.info(`Server running at ${backendUrl}`);
});

server.on('error', (err: any) => {
  logger.fatal({ error: err }, `Failed to start server on port ${backendPort}`);

  process.exit(1); // Force terminate the process safely
});

// Add the shutdown logic here
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();

  server.close(() => {
    logger.info('Process terminated.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
