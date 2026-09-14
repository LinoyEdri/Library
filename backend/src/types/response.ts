import status from 'http-status-codes';
import { getStatusText } from '../utils/status-text.ts';

export interface ApiSuccessResponse<T> {
  success: true;
  code: string
  message: string;
  data: T;
  meta?: unknown;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details?: ApiErrorDetail[];
  };
  requestId?: string|undefined;
}

export const ApiResponse = {
  success: <T> (
    data: T,
    message = "Success",
    code = getStatusText(status.OK),
    meta?: unknown
  ) : ApiSuccessResponse<T> => {
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
    requestId?: string
  ): ApiErrorResponse => {
    return {
      success: false,
      message,
      error: {
        code,
        ...(details && { details }), // Only include details if provided
      },
      ...(requestId && { requestId }), // Only include requestId if provided
    }  
  }
};
