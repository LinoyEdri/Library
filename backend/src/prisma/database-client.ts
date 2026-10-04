import type { Prisma, PrismaClient } from "@prisma/client";

// Either the main Prisma client or the client of an open transaction.
// Repositories accept it so several writes can share one transaction.
export type DatabaseClient = PrismaClient | Prisma.TransactionClient;
