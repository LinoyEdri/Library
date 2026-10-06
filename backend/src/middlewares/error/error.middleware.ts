import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { logger } from '../../logger/logger.ts';
import { ApiResponse } from '../../utils/http/api-response.ts';
import { getStatusText } from '../../utils/http/status-text.ts';
import { getErrorMessage } from '../../utils/errors/get-error-message.ts';
import { getErrorStatusCode } from '../../utils/errors/get-error-status-code.ts';
import { getValidationErrorDetails } from '../../utils/errors/get-validation-error-details.ts';

// Last middleware: turns any error into the standard error envelope
export const errorMiddleware: ErrorRequestHandler = (
  error: unknown,
  request,
  response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next,
): void => {
  const statusCode = getErrorStatusCode(error);

  const message = getErrorMessage(error, statusCode);

  const details = error instanceof ZodError ? getValidationErrorDetails(error) : undefined;

  logger.error(
    {
      message: message,
      method: request.method,
      path: request.originalUrl,
      statusCode,
    },
    'Request failed',
  );

  response
    .status(statusCode)
    .json(ApiResponse.error(message, getStatusText(statusCode), details, request.requestId));
};
