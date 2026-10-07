import { StatusCodes } from 'http-status-codes';
import { ApiRequestError } from '../services/api-request-error';

// The server refused because the user may not see this record (403)
export const isForbiddenError = (error: unknown): boolean =>
  error instanceof ApiRequestError && error.statusCode === StatusCodes.FORBIDDEN;
