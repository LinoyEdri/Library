import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type {
  PasswordResetCodeSentResponse,
  PasswordResetCodeVerifiedResponse,
} from '@library/shared';
import { TimeRemainingIndicator } from '../../components/feedback/TimeRemainingIndicator';
import { FormTextField } from '../../components/forms/FormTextField';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { usePasswordResetCodeForm } from './hooks/usePasswordResetCodeForm';

const { passwordReset: texts } = HebrewTexts;

type PasswordResetCodeFormProps = {
  codeSent: PasswordResetCodeSentResponse;
  onCodeVerified: (verified: PasswordResetCodeVerifiedResponse) => void;
  onResendCode: () => void;
  isResending: boolean;
  onChangeMethod: () => void;
};

// Step 2 of "forgot password": the code that was sent, with a 5-minute countdown (at 0 it is back to login).
// Rendered with a key per request, so a new code starts with an empty field and a fresh timer.
export function PasswordResetCodeForm({
  codeSent,
  onCodeVerified,
  onResendCode,
  isResending,
  onChangeMethod,
}: PasswordResetCodeFormProps) {
  const codeForm = usePasswordResetCodeForm(codeSent, onCodeVerified);

  return (
    <Stack
      component="form"
      spacing={2}
      noValidate
      onSubmit={codeForm.submitCode}
    >
      <Typography
        sx={{
          textAlign: 'center',
        }}
      >
        {texts.codeSentTo}{' '}
        <Box
          component="bdi"
          dir="ltr"
          sx={{
            fontWeight: 600,
          }}
        >
          {codeSent.maskedDestination}
        </Box>
      </Typography>

      <TimeRemainingIndicator
        remainingText={codeForm.countdown.remainingText}
        isRunningOut={codeForm.countdown.isRunningOut}
        isExpired={codeForm.countdown.isExpired}
      />

      {codeForm.verifyErrorMessage && <Alert severity="error">{codeForm.verifyErrorMessage}</Alert>}

      <FormTextField
        control={codeForm.control}
        name="code"
        label={texts.codeField}
        autoComplete="one-time-code"
        autoFocus
        slotProps={{
          htmlInput: {
            inputMode: 'numeric',
            maxLength: 6,
            dir: 'ltr',
            style: {
              textAlign: 'center',
              letterSpacing: '0.4em',
              fontSize: '1.25rem',
            },
          },
        }}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        loading={codeForm.isSubmitting}
      >
        {texts.verifyCodeButton}
      </Button>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Button
          size="small"
          loading={isResending}
          onClick={onResendCode}
        >
          {texts.resendCode}
        </Button>

        <Button
          size="small"
          color="inherit"
          onClick={onChangeMethod}
        >
          {texts.changeMethod}
        </Button>
      </Box>
    </Stack>
  );
}
