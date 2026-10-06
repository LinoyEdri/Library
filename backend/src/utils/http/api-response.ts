import status from 'http-status-codes';
import { getStatusText } from './status-text.ts';
import type { ApiErrorDetail, ApiErrorResponse, ApiSuccessResponse } from '@library/shared';

// Builds the standard success/error envelopes (types come from @library/shared)
export const ApiResponse = {
  success: <T>(
    data: T,
    message = 'Success',
    code = getStatusText(status.OK),
    meta?: unknown,
  ): ApiSuccessResponse<T> => {
    return {
      success: true,
      code,
      message,
      data,
      ...(meta !== undefined && { meta }), // Only include meta if it's provided
    };
  },

  error: (
    message: string,
    code = getStatusText(status.INTERNAL_SERVER_ERROR),
    details?: ApiErrorDetail[],
    requestId?: string,
  ): ApiErrorResponse => {
    return {
      success: false,
      message,
      error: {
        code,
        ...(details && { details }), // Only include details if provided
      },
      ...(requestId && { requestId }), // Only include requestId if provided
    };
  },
};
