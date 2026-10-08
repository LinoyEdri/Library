import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AddressFormFields } from '../../components/forms/AddressFormFields';
import { FormTextField } from '../../components/forms/FormTextField';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { RoutePaths } from '../../constants/route-paths';
import { FormActions } from '../../components/forms/FormActions';
import { useNewPersonMemberForm } from './hooks/useNewPersonMemberForm';

const twoColumnRowStyle = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: {
    sm: '1fr 1fr',
  },
};

// New person: account details, initial password and address
export function NewPersonMemberForm() {
  const { control, submitNewPerson, isSaving } = useNewPersonMemberForm();

  return (
    <Stack
      component="form"
      spacing={2}
      noValidate
      onSubmit={submitNewPerson}
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

      <FormTextField
        control={control}
        name="password"
        type="password"
        label={HebrewTexts.members.initialPasswordField}
        helperText={HebrewTexts.members.initialPasswordHelp}
        autoComplete="new-password"
      />

      <Typography
        variant="h6"
        component="h3"
      >
        {HebrewTexts.members.addressTitle}
      </Typography>

      <AddressFormFields control={control} />

      <FormActions
        isSaving={isSaving}
        cancelPath={RoutePaths.MEMBERS}
      />
    </Stack>
  );
}
