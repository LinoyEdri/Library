import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { RoutePaths } from '../../../constants/route-paths';
import { useNotification } from '../../../hooks/useNotification';
import { ApiRequestError } from '../../../services/api-request-error';
import { authenticationApi } from '../../../services/authentication.api';
import { applyServerFieldErrors } from '../../../utils/apply-server-field-errors';
import { getHebrewErrorMessage } from '../../../utils/get-hebrew-error-message';
import {
  registerFormSchema,
  type RegisterFormInput,
  type RegisterFormOutput,
} from '../register-form.schema';

// Sign-up form state, validation and submit (then go to login)
export const useRegisterForm = () => {
  const navigate = useNavigate();

  const { showNotification } = useNotification();

  const [registrationErrorMessage, setRegistrationErrorMessage] = useState<string | null>(null);

  const registerMutation = useMutation({ mutationFn: authenticationApi.register });

  const { control, handleSubmit, setError } = useForm<
    RegisterFormInput,
    unknown,
    RegisterFormOutput
  >({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      address: {
        street: '',
        houseNumber: '',
        apartmentOrUnit: '',
        city: '',
      },
    },
  });

  const submitRegistration = handleSubmit(async ({ confirmPassword, ...registration }) => {
    setRegistrationErrorMessage(null);

    try {
      await registerMutation.mutateAsync(registration);

      showNotification(HebrewTexts.authentication.registrationSucceeded);

      navigate(RoutePaths.LOGIN);
    } catch (error) {
      if (error instanceof ApiRequestError && error.statusCode === StatusCodes.CONFLICT) {
        setError('email', { message: HebrewTexts.authentication.emailAlreadyRegistered });
        return;
      }

      if (!applyServerFieldErrors(error, setError)) {
        setRegistrationErrorMessage(getHebrewErrorMessage(error));
      }
    }
  });

  return {
    control,
    submitRegistration,
    isSubmitting: registerMutation.isPending,
    registrationErrorMessage,
  };
};
