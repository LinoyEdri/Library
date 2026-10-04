import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { loginSchema } from '@library/shared';
import { FormTextField } from '../../components/forms/FormTextField';
import { AuthenticationPageLayout } from '../../components/layout/AuthenticationPageLayout';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { RoutePaths } from '../../constants/route-paths';
import { useAuthentication } from '../../hooks/useAuthentication';
import { getHebrewErrorMessage } from '../../utils/get-hebrew-error-message';

type LoginFormInput = z.input<typeof loginSchema>;
type LoginFormOutput = z.output<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuthentication();

  const navigate = useNavigate();

  const location = useLocation();

  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(null);

  const { control, handleSubmit, formState } = useForm<LoginFormInput, unknown, LoginFormOutput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // After login, go back to the page the user originally asked for
  const returnToPath =
    (location.state as { returnTo?: string } | null)?.returnTo ?? RoutePaths.HOME;

  const submitLogin = async (credentials: LoginFormOutput) => {
    setLoginErrorMessage(null);

    try {
      await login(credentials);

      navigate(returnToPath, { replace: true });
    } catch (error) {
      setLoginErrorMessage(
        getHebrewErrorMessage(error, { 401: HebrewTexts.authentication.invalidCredentials }),
      );
    }
  };

  return (
    <AuthenticationPageLayout
      title={HebrewTexts.authentication.loginTitle}
      subtitle={HebrewTexts.authentication.loginSubtitle}
    >
      <Stack component="form" spacing={2} noValidate onSubmit={handleSubmit(submitLogin)}>
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

        <Button type="submit" variant="contained" size="large" loading={formState.isSubmitting}>
          {HebrewTexts.authentication.loginButton}
        </Button>

        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          {HebrewTexts.authentication.noAccountQuestion}{' '}
          <Link component={RouterLink} to={RoutePaths.REGISTER}>
            {HebrewTexts.authentication.registerLink}
          </Link>
        </Typography>
      </Stack>
    </AuthenticationPageLayout>
  );
}
