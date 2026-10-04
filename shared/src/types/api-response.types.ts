// Envelope returned by every successful API call
export interface ApiSuccessResponse<T> {
  success: true;
  code: string;
  message: string;
  data: T;
  meta?: unknown;
}

// One field-level problem inside an error response (e.g. a Zod validation issue)
export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

// Envelope returned by every failed API call
export interface ApiErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details?: ApiErrorDetail[];
  };
  requestId?: string | undefined;
}
