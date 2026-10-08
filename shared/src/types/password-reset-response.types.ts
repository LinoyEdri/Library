import type { PasswordResetChannel } from '../enums/password-reset-channel.enum.js';

// The email/SMS that would have been sent, returned only while message delivery is simulated
// (no real email or SMS provider). The app shows it in a popup instead of sending it.
export interface SimulatedPasswordResetMessage {
  channel: PasswordResetChannel;
  recipient: string;
  code: string;
  validMinutes: number;
}

// Answer of POST /auth/forgot-password: the code was "sent"
export interface PasswordResetCodeSentResponse {
  requestId: string;
  channel: PasswordResetChannel;
  // Where the code went, partly hidden, e.g. "d***@example.com" or "052-***-4567"
  maskedDestination: string;
  codeExpiresDate: string;
  simulatedMessage: SimulatedPasswordResetMessage | null;
}

// Answer of POST /auth/forgot-password/verify: the code was right, the new password can be set
export interface PasswordResetCodeVerifiedResponse {
  resetToken: string;
  resetTokenExpiresDate: string;
}
