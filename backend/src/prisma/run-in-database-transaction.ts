import type { Prisma } from '@prisma/client';
import prisma from './prisma.ts';

// Runs the work inside one database transaction - all writes succeed together or none do
export const runInDatabaseTransaction = <T>(
  work: (transactionClient: Prisma.TransactionClient) => Promise<T>,
): Promise<T> => prisma.$transaction(work);
