import { ApiRequestError, NETWORK_ERROR_STATUS_CODE } from '../services/api-request-error';

// The server could not be reached at all (backend down, no network)
export const isServerUnavailableError = (error: unknown): boolean =>
  error instanceof ApiRequestError && error.statusCode === NETWORK_ERROR_STATUS_CODE;
