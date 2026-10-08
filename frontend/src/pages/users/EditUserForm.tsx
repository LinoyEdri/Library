import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ManagedUserResponse } from '@library/shared';
import { AddressFormFields } from '../../components/forms/AddressFormFields';
import { FormActions } from '../../components/forms/FormActions';
import { FormTextField } from '../../components/forms/FormTextField';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { buildUserDetailsPath } from '../../utils/build-user-paths';
import { useEditUserForm } from './hooks/useEditUserForm';

const twoColumnRowStyle = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: {
    sm: '1fr 1fr',
  },
};

// Edit name, email, phone and address of an account
export function EditUserForm({ editedUser }: { editedUser: ManagedUserResponse }) {
  const { control, submitUserDetails, isSaving } = useEditUserForm(editedUser);

  return (
    <Stack
      component="form"
      spacing={2}
      noValidate
      onSubmit={submitUserDetails}
    >
      <Box sx={twoColumnRowStyle}>
        <FormTextField
          control={control}
          name="firstName"
          label={HebrewTexts.fields.firstName}
          autoFocus
        />

        <FormTextField
          control={control}
          name="lastName"
          label={HebrewTexts.fields.lastName}
        />
      </Box>

      <Box sx={twoColumnRowStyle}>
        <FormTextField
          control={control}
          name="email"
          type="email"
          label={HebrewTexts.fields.email}
        />

        <FormTextField
          control={control}
          name="phoneNumber"
          type="tel"
          label={HebrewTexts.fields.phoneNumber}
        />
      </Box>

      <Typography
        variant="h6"
        component="h3"
      >
        {HebrewTexts.users.addressTitle}
      </Typography>

      <AddressFormFields control={control} />

      <FormActions
        isSaving={isSaving}
        cancelPath={buildUserDetailsPath(editedUser.id)}
      />
    </Stack>
  );
}
