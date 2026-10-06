import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { useNotification } from '../../../hooks/useNotification';
import { ApiRequestError } from '../../../services/api-request-error';
import { authenticationApi } from '../../../services/authentication.api';
import { applyServerFieldErrors } from '../../../utils/apply-server-field-errors';
import { getHebrewErrorMessage } from '../../../utils/get-hebrew-error-message';
import {
  changePasswordFormSchema,
  type ChangePasswordFormInput,
  type ChangePasswordFormOutput,
} from '../change-password-form.schema';

const emptyPasswordFields: ChangePasswordFormInput = {
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
};

// Change password with the current password; the fields are cleared after success
export const useChangePasswordForm = () => {
  const { showNotification } = useNotification();

  const { control, handleSubmit, setError, reset } = useForm<
    ChangePasswordFormInput,
    unknown,
    ChangePasswordFormOutput
  >({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: emptyPasswordFields,
  });

  const changePasswordMutation = useMutation({ mutationFn: authenticationApi.changeOwnPassword });

  const submitPasswordChange = handleSubmit(async ({ confirmNewPassword, ...passwords }) => {
    try {
      await changePasswordMutation.mutateAsync(passwords);

      reset(emptyPasswordFields);

      showNotification(HebrewTexts.profile.passwordChanged);
    } catch (error) {
      if (applyServerFieldErrors(error, setError)) {
        return;
      }

      // A 400 without field details means the current password was wrong
      if (error instanceof ApiRequestError && error.statusCode === StatusCodes.BAD_REQUEST) {
        setError('currentPassword', { message: HebrewTexts.profile.incorrectCurrentPassword });
        return;
      }

      showNotification(getHebrewErrorMessage(error), 'error');
    }
  });

  return {
    control,
    submitPasswordChange,
    isChangingPassword: changePasswordMutation.isPending,
  };
};
