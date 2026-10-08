import { BusinessErrorCode, PasswordResetChannel } from '@library/shared';
import { HebrewTexts } from '../constants/hebrew-texts';
import { ApiRequestError } from '../services/api-request-error';
import { getHebrewErrorMessage } from './get-hebrew-error-message';

const { errors: texts } = HebrewTexts.passwordReset;

// Forgot-password steps: the exact reason (unknown email, wrong code, time over...) when the API names one
export const getPasswordResetErrorMessage = (
  error: unknown,
  channel: PasswordResetChannel = PasswordResetChannel.EMAIL,
): string => {
  const errorCode = error instanceof ApiRequestError ? error.errorCode : undefined;

  const messageByErrorCode: Partial<Record<string, string>> = {
    [BusinessErrorCode.PASSWORD_RESET_ACCOUNT_NOT_FOUND]:
      channel === PasswordResetChannel.SMS
        ? texts.accountNotFoundByPhone
        : texts.accountNotFoundByEmail,
    [BusinessErrorCode.PASSWORD_RESET_PHONE_SHARED]: texts.phoneShared,
    [BusinessErrorCode.PASSWORD_RESET_CODE_INCORRECT]: texts.codeIncorrect,
    [BusinessErrorCode.PASSWORD_RESET_CODE_EXPIRED]: texts.codeExpired,
    [BusinessErrorCode.PASSWORD_RESET_SESSION_EXPIRED]: texts.sessionExpired,
  };

  return (errorCode && messageByErrorCode[errorCode]) || getHebrewErrorMessage(error);
};
