import type { ApiErrorDetail } from '@library/shared';

// Error thrown by every API call. statusCode is 0 when the server could not be reached.
export class ApiRequestError extends Error {
  readonly statusCode: number;
  readonly fieldErrors: ApiErrorDetail[];

  constructor(message: string, statusCode: number, fieldErrors: ApiErrorDetail[] = []) {
    super(message);

    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }
}
