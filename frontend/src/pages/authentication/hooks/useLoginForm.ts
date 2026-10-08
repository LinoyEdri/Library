import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StatusCodes } from 'http-status-codes';
import type { z } from 'zod';
import { loginSchema } from '@library/shared';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { RoutePaths } from '../../../constants/route-paths';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { getHebrewErrorMessage } from '../../../utils/get-hebrew-error-message';

type LoginFormInput = z.input<typeof loginSchema>;
type LoginFormOutput = z.output<typeof loginSchema>;

// Login form state, validation and submit (then back to the page the user asked for)
export const useLoginForm = () => {
  const { login } = useAuthentication();

  const navigate = useNavigate();

  const location = useLocation();

  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(null);

  const { control, handleSubmit, formState } = useForm<LoginFormInput, unknown, LoginFormOutput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const returnToPath =
    (location.state as { returnTo?: string } | null)?.returnTo ?? RoutePaths.HOME;

  const submitLogin = handleSubmit(async (credentials) => {
    setLoginErrorMessage(null);

    try {
      await login(credentials);

      navigate(returnToPath, { replace: true });
    } catch (error) {
      setLoginErrorMessage(
        getHebrewErrorMessage(error, {
          [StatusCodes.UNAUTHORIZED]: HebrewTexts.authentication.invalidCredentials,
        }),
      );
    }
  });

  return {
    control,
    submitLogin,
    isSubmitting: formState.isSubmitting,
    loginErrorMessage,
  };
};
