import { Link as RouterLink } from 'react-router';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { TimeRemainingIndicator } from '../../components/feedback/TimeRemainingIndicator';
import { FormTextField } from '../../components/forms/FormTextField';
import { AuthenticationPageLayout } from '../../components/layout/AuthenticationPageLayout';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { RoutePaths } from '../../constants/route-paths';
import { useResetPasswordForm } from './hooks/useResetPasswordForm';

const { passwordReset: texts } = HebrewTexts;

// After the right code: choose a new password within 5 minutes (then it is back to login)
export function ResetPasswordPage() {
  const resetPasswordForm = useResetPasswordForm();

  return (
    <AuthenticationPageLayout
      title={texts.resetTitle}
      subtitle={texts.resetSubtitle}
    >
      <Stack
        component="form"
        spacing={2}
        noValidate
        onSubmit={resetPasswordForm.submitReset}
      >
        <TimeRemainingIndicator
          remainingText={resetPasswordForm.countdown.remainingText}
          isRunningOut={resetPasswordForm.countdown.isRunningOut}
          isExpired={resetPasswordForm.countdown.isExpired}
        />

        {resetPasswordForm.resetErrorMessage && (
          <Alert severity="error">
            {resetPasswordForm.resetErrorMessage}{' '}
            <Link
              component={RouterLink}
              to={RoutePaths.FORGOT_PASSWORD}
            >
              {texts.startOver}
            </Link>
          </Alert>
        )}

        <FormTextField
          control={resetPasswordForm.control}
          name="newPassword"
          type="password"
          label={HebrewTexts.fields.newPassword}
          autoComplete="new-password"
          autoFocus
        />

        <FormTextField
          control={resetPasswordForm.control}
          name="confirmNewPassword"
          type="password"
          label={HebrewTexts.fields.confirmNewPassword}
          autoComplete="new-password"
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          loading={resetPasswordForm.isSubmitting}
        >
          {texts.resetButton}
        </Button>

        <Typography
          variant="body2"
          sx={{
            textAlign: 'center',
          }}
        >
          <Link
            component={RouterLink}
            to={RoutePaths.LOGIN}
          >
            {texts.backToLogin}
          </Link>
        </Typography>
      </Stack>
    </AuthenticationPageLayout>
  );
}
