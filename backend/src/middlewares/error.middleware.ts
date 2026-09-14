import type { ErrorRequestHandler } from "express";
import { logger } from "../logger/logger.ts";
import status from "http-status-codes";
import { ApiResponse } from "../types/response.ts";
import { AppError } from "../types/errors/AppError.ts";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  request,
  response,
  _next
) => {
    let statusCode = status.INTERNAL_SERVER_ERROR; // Default to 500

  // 1. 🔍 Check if it's a known error thrown by your code
  if (error instanceof AppError) {
    statusCode = error.statusCode;
  } else if (error instanceof Error && "statusCode" in error && typeof error.statusCode === "number") {
    // 2. 🔍 Check if it's a known error thrown by a library (like Prisma)
    statusCode = error.statusCode;
  } 

  const message = statusCode >= 500 
    ? "An internal server error occurred" 
    : (error?.message || "An error occurred");

  logger.error(
    {
      err: error,
      method: request.method,
      path: request.originalUrl,
      statusCode
    },
    "Request failed"
  );

   response.status(statusCode).json(
    ApiResponse.error(message)
  );
};
