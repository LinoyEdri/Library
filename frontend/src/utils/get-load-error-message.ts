import { StatusCodes } from 'http-status-codes';
import { ApiRequestError } from '../services/api-request-error';
import { getHebrewErrorMessage } from './get-hebrew-error-message';

// "Not found" only when the server really answered 404; otherwise the real reason
// (no connection, server error...) so a temporary problem is not shown as a missing record
export const getLoadErrorMessage = (error: unknown, notFoundMessage: string): string => {
  const isNotFound = error instanceof ApiRequestError && error.statusCode === StatusCodes.NOT_FOUND;

  return isNotFound ? notFoundMessage : getHebrewErrorMessage(error);
};

// Retrying makes sense for every failure except a record that does not exist
export const isRetryableLoadError = (error: unknown): boolean =>
  !(error instanceof ApiRequestError && error.statusCode === StatusCodes.NOT_FOUND);
