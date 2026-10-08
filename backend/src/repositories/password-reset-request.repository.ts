import type { PasswordResetChannel, PasswordResetRequest } from '@prisma/client';
import prisma from '../prisma/prisma.ts';
import type { DatabaseClient } from '../types/database/database-client.types.ts';
import {
  includePasswordResetRequestUser,
  type PasswordResetRequestWithUser,
} from '../types/database/password-reset-request-with-user.types.ts';
import { InternalError } from '../types/errors/InternalError.ts';

export const passwordResetRequestRepository = {
  // The code hash needs the request id, so the request is created first and the hash set right after
  async create(
    userId: string,
    channel: PasswordResetChannel,
    codeExpiresDate: Date,
    databaseClient: DatabaseClient = prisma,
  ): Promise<PasswordResetRequest> {
    try {
      return await databaseClient.passwordResetRequest.create({
        data: { userId, channel, codeExpiresDate, codeHash: '' },
      });
    } catch {
      throw new InternalError('Failed to create password reset request');
    }
  },

  async setCodeHash(
    requestId: string,
    codeHash: string,
    databaseClient: DatabaseClient = prisma,
  ): Promise<void> {
    try {
      await databaseClient.passwordResetRequest.update({
        where: { id: requestId },
        data: { codeHash },
      });
    } catch {
      throw new InternalError('Failed to save password reset code');
    }
  },

  async findById(requestId: string): Promise<PasswordResetRequestWithUser | null> {
    try {
      return await prisma.passwordResetRequest.findUnique({
        where: { id: requestId },
        include: includePasswordResetRequestUser,
      });
    } catch {
      throw new InternalError('Failed to load password reset request');
    }
  },

  async findByResetTokenHash(resetTokenHash: string): Promise<PasswordResetRequestWithUser | null> {
    try {
      return await prisma.passwordResetRequest.findUnique({
        where: { resetTokenHash },
        include: includePasswordResetRequestUser,
      });
    } catch {
      throw new InternalError('Failed to load password reset request');
    }
  },

  // Counts a wrong code; reaching the limit closes the request. Returns the new count.
  async recordFailedAttempt(requestId: string, maxAttempts: number, now: Date): Promise<number> {
    try {
      const { failedAttempts } = await prisma.passwordResetRequest.update({
        where: { id: requestId },
        data: { failedAttempts: { increment: 1 } },
      });

      if (failedAttempts >= maxAttempts) {
        await prisma.passwordResetRequest.updateMany({
          where: { id: requestId, closedDate: null },
          data: { closedDate: now },
        });
      }

      return failedAttempts;
    } catch {
      throw new InternalError('Failed to record a wrong password reset code');
    }
  },

  // Opens the reset session only if the request is still open and unverified (guarded)
  async markVerifiedIfOpen(
    requestId: string,
    resetTokenHash: string,
    resetTokenExpiresDate: Date,
    now: Date,
  ): Promise<boolean> {
    try {
      const { count } = await prisma.passwordResetRequest.updateMany({
        where: { id: requestId, closedDate: null, verifiedDate: null },
        data: { verifiedDate: now, resetTokenHash, resetTokenExpiresDate },
      });

      return count === 1;
    } catch {
      throw new InternalError('Failed to verify password reset code');
    }
  },

  // Closes the request only if it is still open; false when another request closed it first
  async closeIfOpen(
    requestId: string,
    now: Date,
    databaseClient: DatabaseClient = prisma,
  ): Promise<boolean> {
    try {
      const { count } = await databaseClient.passwordResetRequest.updateMany({
        where: { id: requestId, closedDate: null },
        data: { closedDate: now },
      });

      return count === 1;
    } catch {
      throw new InternalError('Failed to close password reset request');
    }
  },

  // Closes every still-open request of the user (a new request replaces them; a reset ends them)
  async closeOpenRequestsOfUser(
    userId: string,
    now: Date,
    databaseClient: DatabaseClient = prisma,
  ): Promise<void> {
    try {
      await databaseClient.passwordResetRequest.updateMany({
        where: { userId, closedDate: null },
        data: { closedDate: now },
      });
    } catch {
      throw new InternalError('Failed to close password reset requests');
    }
  },
};
