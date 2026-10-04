import { Link as RouterLink } from 'react-router';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FormTextField } from '../../components/forms/FormTextField';
import { AuthenticationPageLayout } from '../../components/layout/AuthenticationPageLayout';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { RoutePaths } from '../../constants/route-paths';
import { useLoginForm } from './hooks/useLoginForm';

export function LoginPage() {
  const { control, submitLogin, isSubmitting, loginErrorMessage } = useLoginForm();

  return (
    <AuthenticationPageLayout
      title={HebrewTexts.authentication.loginTitle}
      subtitle={HebrewTexts.authentication.loginSubtitle}
    >
      <Stack
        component="form"
        spacing={2}
        noValidate
        onSubmit={submitLogin}
      >
        {loginErrorMessage && <Alert severity="error">{loginErrorMessage}</Alert>}

        <FormTextField
          control={control}
          name="email"
          type="email"
          label={HebrewTexts.fields.email}
          autoComplete="email"
          autoFocus
        />

        <FormTextField
          control={control}
          name="password"
          type="password"
          label={HebrewTexts.fields.password}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
        >
          {HebrewTexts.authentication.loginButton}
        </Button>

        <Typography
          variant="body2"
          sx={{
            textAlign: 'center',
          }}
        >
          {HebrewTexts.authentication.noAccountQuestion}{' '}
          <Link
            component={RouterLink}
            to={RoutePaths.REGISTER}
          >
            {HebrewTexts.authentication.registerLink}
          </Link>
        </Typography>
      </Stack>
    </AuthenticationPageLayout>
  );
}
