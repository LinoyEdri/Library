import type { ErrorWithStatusCode } from '../../types/errors/error-with-status-code.types.ts';

// True for Error objects that have a statusCode property
export const isErrorWithStatusCode = (error: unknown): error is ErrorWithStatusCode =>
  error instanceof Error && 'statusCode' in error;
