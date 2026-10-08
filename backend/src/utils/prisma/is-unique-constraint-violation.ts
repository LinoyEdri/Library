import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { PrismaErrorCodes } from '../../prisma/error-codes.ts';

// True when Prisma rejected a write because a unique column (e.g. name, email) already exists
export const isUniqueConstraintViolation = (error: unknown): boolean =>
  error instanceof PrismaClientKnownRequestError &&
  error.code === PrismaErrorCodes.UNIQUE_CONSTRAINT;
