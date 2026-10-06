import type { ZodError } from 'zod';
import type { ApiErrorDetail } from '@library/shared';

// One { field, message, code } entry per Zod issue, e.g. { field: 'address.city', ... }
export const getValidationErrorDetails = (error: ZodError): ApiErrorDetail[] =>
  error.issues.map((issue) => ({
    field: issue.path.join('.') || 'request',
    message: issue.message,
    code: issue.code,
  }));
