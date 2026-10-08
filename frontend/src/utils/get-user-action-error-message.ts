import { StatusCodes } from 'http-status-codes';
import { BusinessErrorCode } from '@library/shared';
import { HebrewTexts } from '../constants/hebrew-texts';
import { ApiRequestError } from '../services/api-request-error';
import { getHebrewErrorMessage } from './get-hebrew-error-message';

// Role change / disable errors: a disabled account cannot become admin;
// any other 409 here means the last active admin (or the same role)
export const getUserActionErrorMessage = (error: unknown): string => {
  if (
    error instanceof ApiRequestError &&
    error.errorCode === BusinessErrorCode.ADMIN_HANDOVER_TARGET_NOT_ACTIVE
  ) {
    return HebrewTexts.users.adminHandoverTargetNotActive;
  }

  return getHebrewErrorMessage(error, {
    [StatusCodes.CONFLICT]: HebrewTexts.users.lastActiveAdmin,
  });
};
