import { HebrewTexts } from '../constants/hebrew-texts';
import { ApiRequestError } from '../services/api-request-error';
import { getHebrewErrorMessage } from './get-hebrew-error-message';

type LoanBusinessErrorCode = keyof typeof HebrewTexts.loanErrors;

const isLoanBusinessErrorCode = (
  errorCode: string | undefined,
): errorCode is LoanBusinessErrorCode =>
  errorCode !== undefined && errorCode in HebrewTexts.loanErrors;

// Loan actions: the exact broken rule (e.g. "no available copy") when the API names one
export const getLoanErrorMessage = (error: unknown): string =>
  error instanceof ApiRequestError && isLoanBusinessErrorCode(error.errorCode)
    ? HebrewTexts.loanErrors[error.errorCode]
    : getHebrewErrorMessage(error);
