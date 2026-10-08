import type { Request, Response } from 'express';
import { ApiResponse } from '../../utils/http/api-response.ts';
import status from 'http-status-codes';
import { getStatusText } from '../../utils/http/status-text.ts';

export function notFoundMiddleware(request: Request, response: Response): void {
  const errorMessage = `Route not found: ${request.method} ${request.originalUrl}`;

  response
    .status(status.NOT_FOUND)
    .json(
      ApiResponse.error(
        errorMessage,
        getStatusText(status.NOT_FOUND),
        undefined,
        request.requestId,
      ),
    );
}
