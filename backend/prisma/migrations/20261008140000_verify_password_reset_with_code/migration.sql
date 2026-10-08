-- Password reset now works with a 6-digit code sent by email or SMS instead of a link:
-- the token table becomes a request table. Links created before this change are closed.

-- CreateEnum
CREATE TYPE "PasswordResetChannel" AS ENUM ('EMAIL', 'SMS');

-- Rename the table and its constraints and indexes
ALTER TABLE "PasswordResetToken" RENAME TO "PasswordResetRequest";
ALTER TABLE "PasswordResetRequest" RENAME CONSTRAINT "PasswordResetToken_pkey" TO "PasswordResetRequest_pkey";
ALTER TABLE "PasswordResetRequest" RENAME CONSTRAINT "PasswordResetToken_userId_fkey" TO "PasswordResetRequest_userId_fkey";
ALTER INDEX "PasswordResetToken_userId_idx" RENAME TO "PasswordResetRequest_userId_idx";
ALTER INDEX "PasswordResetToken_tokenHash_key" RENAME TO "PasswordResetRequest_resetTokenHash_key";

-- The reset session token is created only after the code is verified
ALTER TABLE "PasswordResetRequest" RENAME COLUMN "tokenHash" TO "resetTokenHash";
ALTER TABLE "PasswordResetRequest" ALTER COLUMN "resetTokenHash" DROP NOT NULL;
ALTER TABLE "PasswordResetRequest" RENAME COLUMN "expiresDate" TO "resetTokenExpiresDate";
ALTER TABLE "PasswordResetRequest" ALTER COLUMN "resetTokenExpiresDate" DROP NOT NULL;
ALTER TABLE "PasswordResetRequest" RENAME COLUMN "usedDate" TO "closedDate";

-- The code step (existing rows get placeholder values and are closed below)
ALTER TABLE "PasswordResetRequest" ADD COLUMN "channel" "PasswordResetChannel" NOT NULL DEFAULT 'EMAIL';
ALTER TABLE "PasswordResetRequest" ALTER COLUMN "channel" DROP DEFAULT;
ALTER TABLE "PasswordResetRequest" ADD COLUMN "codeHash" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PasswordResetRequest" ALTER COLUMN "codeHash" DROP DEFAULT;
ALTER TABLE "PasswordResetRequest" ADD COLUMN "codeExpiresDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "PasswordResetRequest" ALTER COLUMN "codeExpiresDate" DROP DEFAULT;
ALTER TABLE "PasswordResetRequest" ADD COLUMN "failedAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "PasswordResetRequest" ADD COLUMN "verifiedDate" TIMESTAMP(3);

-- Old links cannot be used with the new flow
UPDATE "PasswordResetRequest" SET "closedDate" = CURRENT_TIMESTAMP WHERE "closedDate" IS NULL;
