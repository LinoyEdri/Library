import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BusinessErrorCode,
  verifyPasswordResetCodeSchema,
  type PasswordResetCodeSentResponse,
  type PasswordResetCodeVerifiedResponse,
} from '@library/shared';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { useCountdown } from '../../../hooks/useCountdown';
import { ApiRequestError } from '../../../services/api-request-error';
import { authenticationApi } from '../../../services/authentication.api';
import { getPasswordResetErrorMessage } from '../../../utils/get-password-reset-error-message';
import { useRedirectToLoginWhenExpired } from './useRedirectToLoginWhenExpired';

const codeFormSchema = verifyPasswordResetCodeSchema.pick({ code: true });

type CodeFormInput = z.input<typeof codeFormSchema>;
type CodeFormOutput = z.output<typeof codeFormSchema>;

// Step 2: type the 6-digit code before it expires (then it is back to login); a wrong code stays on the field
export const usePasswordResetCodeForm = (
  codeSent: PasswordResetCodeSentResponse,
  onCodeVerified: (verified: PasswordResetCodeVerifiedResponse) => void,
) => {
  const countdown = useCountdown(codeSent.codeExpiresDate);

  useRedirectToLoginWhenExpired(countdown.isExpired, HebrewTexts.passwordReset.codeTimeExpired);

  const [verifyErrorMessage, setVerifyErrorMessage] = useState<string | null>(null);

  const { control, handleSubmit, formState, setError } = useForm<
    CodeFormInput,
    unknown,
    CodeFormOutput
  >({
    resolver: zodResolver(codeFormSchema),
    defaultValues: {
      code: '',
    },
  });

  const submitCode = handleSubmit(async ({ code }) => {
    setVerifyErrorMessage(null);

    try {
      onCodeVerified(
        await authenticationApi.verifyPasswordResetCode({ requestId: codeSent.requestId, code }),
      );
    } catch (error) {
      const isWrongCode =
        error instanceof ApiRequestError &&
        error.errorCode === BusinessErrorCode.PASSWORD_RESET_CODE_INCORRECT;

      if (isWrongCode) {
        setError('code', { message: getPasswordResetErrorMessage(error) });
        return;
      }

      setVerifyErrorMessage(getPasswordResetErrorMessage(error));
    }
  });

  return {
    control,
    submitCode,
    isSubmitting: formState.isSubmitting,
    verifyErrorMessage,
    countdown,
  };
};
