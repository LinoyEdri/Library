import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  PasswordResetChannel,
  type ForgotPasswordInput,
  type PasswordResetCodeSentResponse,
} from '@library/shared';
import { authenticationApi } from '../../../services/authentication.api';
import { getPasswordResetErrorMessage } from '../../../utils/get-password-reset-error-message';
import {
  passwordResetRequestFormSchema,
  type PasswordResetRequestFormInput,
} from '../password-reset-request-form.schema';

// Step 1: choose email or SMS, type the address/number and ask for a code
export const usePasswordResetRequestForm = (
  onCodeSent: (request: ForgotPasswordInput, codeSent: PasswordResetCodeSentResponse) => void,
) => {
  const [requestErrorMessage, setRequestErrorMessage] = useState<string | null>(null);

  const { control, handleSubmit, formState } = useForm<
    PasswordResetRequestFormInput,
    unknown,
    ForgotPasswordInput
  >({
    resolver: zodResolver(passwordResetRequestFormSchema),
    defaultValues: {
      channel: PasswordResetChannel.EMAIL,
      email: '',
      phoneNumber: '',
    },
  });

  const selectedChannel = useWatch({ control, name: 'channel' });

  const submitRequest = handleSubmit(async (request) => {
    setRequestErrorMessage(null);

    try {
      onCodeSent(request, await authenticationApi.requestPasswordResetCode(request));
    } catch (error) {
      setRequestErrorMessage(getPasswordResetErrorMessage(error, request.channel));
    }
  });

  return {
    control,
    submitRequest,
    isSubmitting: formState.isSubmitting,
    isSmsSelected: selectedChannel === PasswordResetChannel.SMS,
    requestErrorMessage,
  };
};
