import { createApp } from "./app.js";
import { backendPort, nodeEnv } from "./config/env.ts";
import prisma from "./prisma/prisma.ts";
import { logger } from "./logger/logger.ts";

const app = createApp();

const server = app.listen(backendPort, () => {
  logger.info(
    {
      port: backendPort,
      environment: nodeEnv
    },
    "Library API started"
  );
});

async function shutdown(signal: string): Promise<void> {
  logger.info(
    { signal }, 
    "Shutdown signal received"
  );
  await prisma.$disconnect(); // Disconnect from the database

  server.close((error) => {
    if (error) {
      logger.error(
        { err: error }, 
        "Error during server shutdown"
      );
      process.exit(1);
    }

    logger.info("HTTP server closed");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
