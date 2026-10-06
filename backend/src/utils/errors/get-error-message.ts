import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import { AppError } from '../../types/errors/AppError.ts';

// Message sent to the client. Server errors (5xx) never expose internal details.
export const getErrorMessage = (error: unknown, statusCode: number): string => {
  if (statusCode >= StatusCodes.INTERNAL_SERVER_ERROR) {
    return 'An internal server error occurred';
  }

  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof ZodError) {
    return 'Validation failed';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};
