import type { PasswordResetChannel } from '@prisma/client';
import type { SimulatedPasswordResetMessage } from '@library/shared';

// What the password reset service returns (Date objects; sent as ISO strings)

export interface PasswordResetCodeSentRecord {
  requestId: string;
  channel: PasswordResetChannel;
  maskedDestination: string;
  codeExpiresDate: Date;
  simulatedMessage: SimulatedPasswordResetMessage | null;
}

export interface PasswordResetCodeVerifiedRecord {
  resetToken: string;
  resetTokenExpiresDate: Date;
}
