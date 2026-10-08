import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { RoutePaths } from '../../../constants/route-paths';
import { useCountdown } from '../../../hooks/useCountdown';
import { useNotification } from '../../../hooks/useNotification';
import { authenticationApi } from '../../../services/authentication.api';
import { applyServerFieldErrors } from '../../../utils/apply-server-field-errors';
import { getPasswordResetErrorMessage } from '../../../utils/get-password-reset-error-message';
import {
  resetPasswordFormSchema,
  type ResetPasswordFormInput,
  type ResetPasswordFormOutput,
} from '../reset-password-form.schema';
import type { ResetPasswordPageState } from './useForgotPasswordPage';
import { useRedirectToLoginWhenExpired } from './useRedirectToLoginWhenExpired';

// Opened from a verified code: the session token comes in the navigation state, valid 5 minutes;
// when they are over (or there is no session) the user is sent back to login
export const useResetPasswordForm = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const { showNotification } = useNotification();

  const resetSession = location.state as ResetPasswordPageState | null;

  // Without a session the countdown has nothing to count, so it starts expired
  const countdown = useCountdown(resetSession?.resetTokenExpiresDate ?? new Date(0).toISOString());

  // No session (page opened directly) or its 5 minutes are over: back to login with the reason
  useRedirectToLoginWhenExpired(
    countdown.isExpired,
    resetSession
      ? HebrewTexts.passwordReset.errors.sessionExpired
      : HebrewTexts.passwordReset.noActiveReset,
  );

  const [resetErrorMessage, setResetErrorMessage] = useState<string | null>(null);

  const { control, handleSubmit, formState, setError } = useForm<
    ResetPasswordFormInput,
    unknown,
    ResetPasswordFormOutput
  >({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const submitReset = handleSubmit(async ({ newPassword }) => {
    setResetErrorMessage(null);

    try {
      await authenticationApi.resetPassword({ token: resetSession?.resetToken ?? '', newPassword });

      showNotification(HebrewTexts.passwordReset.resetSucceeded);

      navigate(RoutePaths.LOGIN, { replace: true });
    } catch (error) {
      // Password rule errors go to the field; anything else is shown above the form
      if (!applyServerFieldErrors(error, setError)) {
        setResetErrorMessage(getPasswordResetErrorMessage(error));
      }
    }
  });

  return {
    control,
    submitReset,
    isSubmitting: formState.isSubmitting,
    countdown,
    resetErrorMessage,
  };
};
