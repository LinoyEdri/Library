import { Controller } from 'react-hook-form';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import {
  PasswordResetChannel,
  type ForgotPasswordInput,
  type PasswordResetCodeSentResponse,
} from '@library/shared';
import { FormTextField } from '../../components/forms/FormTextField';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { usePasswordResetRequestForm } from './hooks/usePasswordResetRequestForm';

const { passwordReset: texts } = HebrewTexts;

type PasswordResetRequestFormProps = {
  onCodeSent: (request: ForgotPasswordInput, codeSent: PasswordResetCodeSentResponse) => void;
};

// Step 1 of "forgot password": where to send the verification code
export function PasswordResetRequestForm({ onCodeSent }: PasswordResetRequestFormProps) {
  const requestForm = usePasswordResetRequestForm(onCodeSent);

  return (
    <Stack
      component="form"
      spacing={2}
      noValidate
      onSubmit={requestForm.submitRequest}
    >
      {requestForm.requestErrorMessage && (
        <Alert severity="error">{requestForm.requestErrorMessage}</Alert>
      )}

      <Typography
        variant="body2"
        color="text.secondary"
      >
        {texts.channelLabel}
      </Typography>

      <Controller
        control={requestForm.control}
        name="channel"
        render={({ field }) => (
          <ToggleButtonGroup
            exclusive
            fullWidth
            color="primary"
            value={field.value}
            onChange={(_event, selectedChannel: PasswordResetChannel | null) =>
              selectedChannel && field.onChange(selectedChannel)
            }
          >
            <ToggleButton
              value={PasswordResetChannel.EMAIL}
              sx={{
                gap: 1,
              }}
            >
              <EmailOutlinedIcon fontSize="small" />
              {texts.emailChannel}
            </ToggleButton>

            <ToggleButton
              value={PasswordResetChannel.SMS}
              sx={{
                gap: 1,
              }}
            >
              <SmsOutlinedIcon fontSize="small" />
              {texts.smsChannel}
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      />

      {requestForm.isSmsSelected ? (
        <FormTextField
          key="phoneNumber"
          control={requestForm.control}
          name="phoneNumber"
          type="tel"
          label={texts.phoneNumberField}
          autoComplete="tel"
          autoFocus
        />
      ) : (
        <FormTextField
          key="email"
          control={requestForm.control}
          name="email"
          type="email"
          label={HebrewTexts.fields.email}
          autoComplete="email"
          autoFocus
        />
      )}

      <Button
        type="submit"
        variant="contained"
        size="large"
        loading={requestForm.isSubmitting}
      >
        {texts.sendCodeButton}
      </Button>
    </Stack>
  );
}
