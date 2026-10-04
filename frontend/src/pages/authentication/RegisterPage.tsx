import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FormTextField } from '../../components/forms/FormTextField';
import { AuthenticationPageLayout } from '../../components/layout/AuthenticationPageLayout';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { RoutePaths } from '../../constants/route-paths';
import { useNotification } from '../../hooks/useNotification';
import { authenticationApi } from '../../services/authentication.api';
import { ApiRequestError } from '../../services/api-request-error';
import { applyServerFieldErrors } from '../../utils/apply-server-field-errors';
import { getHebrewErrorMessage } from '../../utils/get-hebrew-error-message';
import {
  registerFormSchema,
  type RegisterFormInput,
  type RegisterFormOutput,
} from './register-form.schema';

// Two fields side by side on wider screens, stacked on phones
const twoColumnRowStyle = { display: 'grid', gap: 2, gridTemplateColumns: { sm: '1fr 1fr' } };

export function RegisterPage() {
  const navigate = useNavigate();

  const { showNotification } = useNotification();

  const [registrationErrorMessage, setRegistrationErrorMessage] = useState<string | null>(null);

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
      address: { street: '', houseNumber: '', apartmentOrUnit: '', city: '' },
    },
  });

  const registerMutation = useMutation({ mutationFn: authenticationApi.register });

  const submitRegistration = async ({ confirmPassword, ...registration }: RegisterFormOutput) => {
    setRegistrationErrorMessage(null);

    try {
      await registerMutation.mutateAsync(registration);

      showNotification(HebrewTexts.authentication.registrationSucceeded);

      navigate(RoutePaths.LOGIN);
    } catch (error) {
      if (error instanceof ApiRequestError && error.statusCode === 409) {
        setError('email', { message: HebrewTexts.authentication.emailAlreadyRegistered });
        return;
      }

      if (!applyServerFieldErrors(error, setError)) {
        setRegistrationErrorMessage(getHebrewErrorMessage(error));
      }
    }
  };

  return (
    <AuthenticationPageLayout
      title={HebrewTexts.authentication.registerTitle}
      subtitle={HebrewTexts.authentication.registerSubtitle}
      maxWidth={640}
    >
      <Stack component="form" spacing={2} noValidate onSubmit={handleSubmit(submitRegistration)}>
        {registrationErrorMessage && <Alert severity="error">{registrationErrorMessage}</Alert>}

        <Typography variant="h5" component="h2">
          {HebrewTexts.authentication.personalDetailsSection}
        </Typography>

        <Box sx={twoColumnRowStyle}>
          <FormTextField control={control} name="firstName" label={HebrewTexts.fields.firstName} />

          <FormTextField control={control} name="lastName" label={HebrewTexts.fields.lastName} />
        </Box>

        <Box sx={twoColumnRowStyle}>
          <FormTextField
            control={control}
            name="email"
            type="email"
            label={HebrewTexts.fields.email}
            autoComplete="email"
          />

          <FormTextField
            control={control}
            name="phoneNumber"
            type="tel"
            label={HebrewTexts.fields.phoneNumber}
            autoComplete="tel"
          />
        </Box>

        <Box sx={twoColumnRowStyle}>
          <FormTextField
            control={control}
            name="password"
            type="password"
            label={HebrewTexts.fields.password}
            autoComplete="new-password"
          />

          <FormTextField
            control={control}
            name="confirmPassword"
            type="password"
            label={HebrewTexts.fields.confirmPassword}
            autoComplete="new-password"
          />
        </Box>

        <Typography variant="h5" component="h2">
          {HebrewTexts.authentication.addressSection}
        </Typography>

        <Box sx={twoColumnRowStyle}>
          <FormTextField control={control} name="address.city" label={HebrewTexts.fields.city} />

          <FormTextField
            control={control}
            name="address.street"
            label={HebrewTexts.fields.street}
          />
        </Box>

        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { sm: '1fr 1fr 1fr' } }}>
          <FormTextField
            control={control}
            name="address.houseNumber"
            label={HebrewTexts.fields.houseNumber}
          />

          <FormTextField
            control={control}
            name="address.apartmentOrUnit"
            label={HebrewTexts.fields.apartmentOrUnit}
          />

          <FormTextField
            control={control}
            name="address.postalCode"
            label={HebrewTexts.fields.postalCode}
            emptyAsUndefined
          />
        </Box>

        <Button type="submit" variant="contained" size="large" loading={registerMutation.isPending}>
          {HebrewTexts.authentication.registerButton}
        </Button>

        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          {HebrewTexts.authentication.haveAccountQuestion}{' '}
          <Link component={RouterLink} to={RoutePaths.LOGIN}>
            {HebrewTexts.authentication.loginLink}
          </Link>
        </Typography>
      </Stack>
    </AuthenticationPageLayout>
  );
}
