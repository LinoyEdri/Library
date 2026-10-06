import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import { AppError } from '../../types/errors/AppError.ts';
import { isErrorWithStatusCode } from './is-error-with-status-code.ts';

// HTTP status for any thrown error: our AppErrors, Zod errors, library errors, else 500
export const getErrorStatusCode = (error: unknown): number => {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  if (error instanceof ZodError) {
    return StatusCodes.BAD_REQUEST;
  }

  if (
    isErrorWithStatusCode(error) &&
    typeof error.statusCode === 'number' &&
    error.statusCode >= StatusCodes.BAD_REQUEST &&
    error.statusCode <= StatusCodes.NETWORK_AUTHENTICATION_REQUIRED
  ) {
    return error.statusCode;
  }

  return StatusCodes.INTERNAL_SERVER_ERROR;
};
