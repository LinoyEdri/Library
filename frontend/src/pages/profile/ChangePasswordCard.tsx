import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FormTextField } from '../../components/forms/FormTextField';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { useChangePasswordForm } from './hooks/useChangePasswordForm';

// Security section: change password using the current password
export function ChangePasswordCard() {
  const { control, submitPasswordChange, isChangingPassword } = useChangePasswordForm();

  return (
    <Card>
      <CardContent>
        <Stack
          component="form"
          spacing={2}
          noValidate
          onSubmit={submitPasswordChange}
        >
          <Typography
            variant="h4"
            component="h2"
          >
            {HebrewTexts.profile.changePasswordTitle}
          </Typography>

          <FormTextField
            control={control}
            name="currentPassword"
            type="password"
            label={HebrewTexts.fields.currentPassword}
            autoComplete="current-password"
          />

          <FormTextField
            control={control}
            name="newPassword"
            type="password"
            label={HebrewTexts.fields.newPassword}
            autoComplete="new-password"
          />

          <FormTextField
            control={control}
            name="confirmNewPassword"
            type="password"
            label={HebrewTexts.fields.confirmNewPassword}
            autoComplete="new-password"
          />

          <Box>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              loading={isChangingPassword}
            >
              {HebrewTexts.profile.changePasswordButton}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
