import type { Request, Response } from "express";
import { ApiResponse } from "../types/response.ts";
import status from "http-status-codes";

export function notFoundMiddleware(
  request: Request,
  response: Response
): void {
  const errorMessage = `Route not found: ${request.method} ${request.originalUrl}`;

  response.status(status.NOT_FOUND).json(
    ApiResponse.error(errorMessage)
  );
}
