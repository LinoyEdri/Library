// backend/src/server.ts
import express from 'express';
import prisma from './prisma/prisma.ts'; // Import your custom client
import { backendPort, backendUrl } from './config/env.ts';

const app = express();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const server = app.listen(backendPort, () => {
  console.log(`Server running at ${backendUrl}`);
});

// Add the shutdown logic here
const shutdown = async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  server.close(() => {
    console.log("Process terminated.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
