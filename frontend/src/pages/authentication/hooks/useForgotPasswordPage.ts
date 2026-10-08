import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import type {
  ForgotPasswordInput,
  PasswordResetCodeSentResponse,
  PasswordResetCodeVerifiedResponse,
  SimulatedPasswordResetMessage,
} from '@library/shared';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { RoutePaths } from '../../../constants/route-paths';
import { useNotification } from '../../../hooks/useNotification';
import { authenticationApi } from '../../../services/authentication.api';
import { getPasswordResetErrorMessage } from '../../../utils/get-password-reset-error-message';

// What the reset page receives in the navigation state (never in the URL)
export type ResetPasswordPageState = PasswordResetCodeVerifiedResponse;

// "Forgot password": step 1 asks where to send the code, step 2 checks it; the "received"
// email/SMS is shown in a popup. The right code moves on to the reset page.
export const useForgotPasswordPage = () => {
  const navigate = useNavigate();

  const { showNotification } = useNotification();

  const [sentRequest, setSentRequest] = useState<ForgotPasswordInput | null>(null);
  const [codeSent, setCodeSent] = useState<PasswordResetCodeSentResponse | null>(null);
  const [receivedMessage, setReceivedMessage] = useState<SimulatedPasswordResetMessage | null>(
    null,
  );

  const showCodeSent = (
    request: ForgotPasswordInput,
    newCodeSent: PasswordResetCodeSentResponse,
  ) => {
    setSentRequest(request);
    setCodeSent(newCodeSent);
    setReceivedMessage(newCodeSent.simulatedMessage);
  };

  const resendMutation = useMutation({
    mutationFn: (request: ForgotPasswordInput) =>
      authenticationApi.requestPasswordResetCode(request),
    onSuccess: (newCodeSent, request) => {
      showCodeSent(request, newCodeSent);
      showNotification(HebrewTexts.passwordReset.codeResent);
    },
    onError: (error, request) =>
      showNotification(getPasswordResetErrorMessage(error, request.channel), 'error'),
  });

  return {
    codeSent,
    receivedMessage,
    closeReceivedMessage: () => setReceivedMessage(null),
    showCodeSent,
    resendCode: () => sentRequest && resendMutation.mutate(sentRequest),
    isResending: resendMutation.isPending,
    changeMethod: () => {
      setCodeSent(null);
      setReceivedMessage(null);
    },
    openResetPage: (verified: PasswordResetCodeVerifiedResponse) =>
      navigate(RoutePaths.RESET_PASSWORD, {
        replace: true,
        state: verified satisfies ResetPasswordPageState,
      }),
  };
};
