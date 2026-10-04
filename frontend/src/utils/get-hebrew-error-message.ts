import { HebrewTexts } from '../constants/hebrew-texts';
import { ApiRequestError } from '../services/api-request-error';

// Optional page-specific messages, e.g. { 401: 'wrong password' } on the login page
type MessageOverridesByStatus = Partial<Record<number, string>>;

const defaultMessageByStatus: Record<number, string> = {
  0: HebrewTexts.errors.networkError,
  400: HebrewTexts.errors.invalidInput,
  401: HebrewTexts.authentication.sessionExpired,
  403: HebrewTexts.errors.forbiddenAction,
  404: HebrewTexts.errors.recordNotFound,
  409: HebrewTexts.errors.conflict,
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
