import { StatusCodes } from 'http-status-codes';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { useNotification } from '../../../hooks/useNotification';
import { ApiRequestError } from '../../../services/api-request-error';
import { applyServerFieldErrors } from '../../../utils/apply-server-field-errors';
import { getHebrewErrorMessage } from '../../../utils/get-hebrew-error-message';

// Shows a duplicate email under the email field, field errors under their fields, anything else as a toast
export const useUserFormSubmitErrorHandler = <FormValues extends FieldValues & { email: unknown }>(
  setError: UseFormSetError<FormValues>,
) => {
  const { showNotification } = useNotification();

  return (error: unknown) => {
    if (error instanceof ApiRequestError && error.statusCode === StatusCodes.CONFLICT) {
      setError('email' as Path<FormValues>, {
        message: HebrewTexts.authentication.emailAlreadyRegistered,
      });
      return;
    }

    if (!applyServerFieldErrors(error, setError)) {
      showNotification(getHebrewErrorMessage(error), 'error');
    }
  };
};
