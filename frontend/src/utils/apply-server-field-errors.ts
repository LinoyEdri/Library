import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiRequestError } from '../services/api-request-error';

// Shows backend validation errors (400 details) under the matching form fields.
// Returns true when at least one field error was applied.
export const applyServerFieldErrors = <FormValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<FormValues>,
): boolean => {
  if (!(error instanceof ApiRequestError) || error.fieldErrors.length === 0) {
    return false;
  }

  for (const fieldError of error.fieldErrors) {
    if (fieldError.field) {
      setError(fieldError.field as Path<FormValues>, { message: fieldError.message });
    }
  }

  return true;
};
