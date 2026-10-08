import type { PasswordResetChannel } from '@prisma/client';
import type { SimulatedPasswordResetMessage } from '@library/shared';
import { simulateMessageDelivery } from '../config/env.ts';
import { PASSWORD_RESET_CODE_LIFETIME_MINUTES } from '../constants/password-reset.ts';
import { logger } from '../logger/logger.ts';

// Sends messages to users by email or SMS. There is no email/SMS provider yet, so while
// SIMULATE_MESSAGE_DELIVERY is on, nothing is sent: the message comes back to be shown in the app.
// A real provider (e.g. SendGrid, Twilio) would plug in here without changing the reset flow.
export const messageDeliveryService = {
  sendPasswordResetCode(
    channel: PasswordResetChannel,
    destination: string,
    code: string,
  ): SimulatedPasswordResetMessage | null {
    if (simulateMessageDelivery) {
      logger.info({ channel }, 'Password reset code delivery simulated (shown in the app)');

      return {
        channel,
        recipient: destination,
        code,
        validMinutes: PASSWORD_RESET_CODE_LIFETIME_MINUTES,
      };
    }

    logger.error({ channel }, 'No email/SMS provider is configured; the reset code was not sent');

    return null;
  },
};
