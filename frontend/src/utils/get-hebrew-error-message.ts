import { StatusCodes } from 'http-status-codes';
import { HebrewTexts } from '../constants/hebrew-texts';
import { ApiRequestError, NETWORK_ERROR_STATUS_CODE } from '../services/api-request-error';

// Optional page-specific messages, e.g. { [StatusCodes.UNAUTHORIZED]: 'wrong password' }
type MessageOverridesByStatus = Partial<Record<number, string>>;

const defaultMessageByStatus: Record<number, string> = {
  [NETWORK_ERROR_STATUS_CODE]: HebrewTexts.errors.networkError,
  [StatusCodes.BAD_REQUEST]: HebrewTexts.errors.invalidInput,
  [StatusCodes.UNAUTHORIZED]: HebrewTexts.authentication.sessionExpired,
  [StatusCodes.FORBIDDEN]: HebrewTexts.errors.forbiddenAction,
  [StatusCodes.NOT_FOUND]: HebrewTexts.errors.recordNotFound,
  [StatusCodes.CONFLICT]: HebrewTexts.errors.conflict,
};

// Turns any thrown error into a Hebrew message for the user
export const getHebrewErrorMessage = (
  error: unknown,
  overrides: MessageOverridesByStatus = {},
): string => {
  if (!(error instanceof ApiRequestError)) {
    return HebrewTexts.errors.serverError;
  }

  return (
    overrides[error.statusCode] ??
    defaultMessageByStatus[error.statusCode] ??
    HebrewTexts.errors.serverError
  );
};
