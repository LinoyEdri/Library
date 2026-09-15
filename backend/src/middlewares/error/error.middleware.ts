import type { ErrorRequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";

import { logger } from "../../logger/logger.ts";
import { ApiResponse } from "../../types/response.ts";
import { AppError } from "../../types/errors/AppError.ts";
import { getStatusText } from "../../utils/status-text.ts";

type ErrorWithStatusCode = Error & {
  statusCode?: unknown;
};

function isErrorWithStatusCode(error: unknown): error is ErrorWithStatusCode {
  return error instanceof Error && "statusCode" in error;
}

function getErrorStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  } else if (error instanceof ZodError) {
    return StatusCodes.BAD_REQUEST;
  } else if (
    isErrorWithStatusCode(error) &&
    typeof error.statusCode === "number" &&
    error.statusCode >= 400 &&
    error.statusCode < 600
  ) {
    return error.statusCode;
  } 

  return StatusCodes.INTERNAL_SERVER_ERROR;
}

function getErrorMessage(error: unknown, statusCode: number): string {
  if (statusCode >= 500) {
    return "An internal server error occurred";
  } else if (error instanceof AppError) {
    return error.message;
  } else if (error instanceof ZodError) {
    return "Validation failed";
  } else if (error instanceof Error) {
    return error.message;
  } 

  return "An unexpected error occurred";
}

function getValidationDetails(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "request",
    message: issue.message,
    code: issue.code,
  }));
}

export const errorMiddleware: ErrorRequestHandler = (
  error: unknown,
  request,
  response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next,
): void => {
  const statusCode = getErrorStatusCode(error);

  const message = getErrorMessage(error, statusCode);

  const details = error instanceof ZodError
    ? getValidationDetails(error)
    : undefined;

  logger.error(
    {
      err: error,
      method: request.method,
      path: request.originalUrl,
      requestId: request.requestId,
      statusCode,
    },
    "Request failed",
  );

  response.status(statusCode).json(
    ApiResponse.error(
      message,
      getStatusText(statusCode),
      details,
      request.requestId,
    ),
  );
};
