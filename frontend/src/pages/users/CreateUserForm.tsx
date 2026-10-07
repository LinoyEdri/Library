import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Role } from '@library/shared';
import { AddressFormFields } from '../../components/forms/AddressFormFields';
import { FormActions } from '../../components/forms/FormActions';
import { FormTextField } from '../../components/forms/FormTextField';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { RoutePaths } from '../../constants/route-paths';
import { useCreateUserForm } from './hooks/useCreateUserForm';

const { users: texts } = HebrewTexts;

const twoColumnRowStyle = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: {
    sm: '1fr 1fr',
  },
};

// New account: personal details, role, initial password and address
export function CreateUserForm() {
  const createForm = useCreateUserForm();

  const { control } = createForm;

  return (
    <Stack
      component="form"
      spacing={2}
      noValidate
      onSubmit={createForm.submitNewUser}
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

      <Box sx={twoColumnRowStyle}>
        <FormTextField
          control={control}
          name="role"
          select
          label={texts.roleField}
        >
          {Object.values(Role).map((role) => (
            <MenuItem
              key={role}
              value={role}
            >
              {HebrewTexts.roles[role]}
            </MenuItem>
          ))}
        </FormTextField>

        <FormTextField
          control={control}
          name="password"
          type="password"
          label={texts.initialPasswordField}
          helperText={texts.initialPasswordHelp}
          autoComplete="new-password"
        />
      </Box>

      {createForm.isMemberRoleSelected && <Alert severity="info">{texts.memberRoleHint}</Alert>}

      <Typography
        variant="h6"
        component="h3"
      >
        {texts.addressTitle}
      </Typography>

      <AddressFormFields control={control} />

      <FormActions
        isSaving={createForm.isSaving}
        cancelPath={RoutePaths.USERS}
      />
    </Stack>
  );
}
