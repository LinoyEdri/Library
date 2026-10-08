import type { ApiErrorDetail } from '@library/shared';

// Not an HTTP status: used when the server could not be reached at all
export const NETWORK_ERROR_STATUS_CODE = 0;

// Error thrown by every API call
export class ApiRequestError extends Error {
  readonly statusCode: number;
  readonly fieldErrors: ApiErrorDetail[];
  // e.g. "LOAN_LIMIT_REACHED" for business rules, otherwise the status text ("NOT_FOUND")
  readonly errorCode: string | undefined;

  constructor(
    message: string,
    statusCode: number,
    fieldErrors: ApiErrorDetail[] = [],
    errorCode?: string,
  ) {
    super(message);

    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
    this.errorCode = errorCode;
  }
}
