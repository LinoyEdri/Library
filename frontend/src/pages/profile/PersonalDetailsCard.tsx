import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FormTextField } from '../../components/forms/FormTextField';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { usePersonalDetailsForm } from './hooks/usePersonalDetailsForm';

const twoColumnRowStyle = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: {
    sm: '1fr 1fr',
  },
};

const threeColumnRowStyle = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: {
    sm: '1fr 1fr 1fr',
  },
};

// Editable name, phone and address of the logged-in user
export function PersonalDetailsCard() {
  const { control, submitPersonalDetails, isSaving, hasUnsavedChanges } = usePersonalDetailsForm();

  return (
    <Card>
      <CardContent>
        <Stack
          component="form"
          spacing={2}
          noValidate
          onSubmit={submitPersonalDetails}
        >
          <Typography
            variant="h4"
            component="h2"
          >
            {HebrewTexts.profile.personalDetailsTitle}
          </Typography>

          <Box sx={twoColumnRowStyle}>
            <FormTextField
              control={control}
              name="firstName"
              label={HebrewTexts.fields.firstName}
            />

            <FormTextField
              control={control}
              name="lastName"
              label={HebrewTexts.fields.lastName}
            />
          </Box>

          <FormTextField
            control={control}
            name="phoneNumber"
            type="tel"
            label={HebrewTexts.fields.phoneNumber}
            autoComplete="tel"
          />

          <Typography
            variant="h6"
            component="h3"
          >
            {HebrewTexts.authentication.addressSection}
          </Typography>

          <Box sx={twoColumnRowStyle}>
            <FormTextField
              control={control}
              name="address.city"
              label={HebrewTexts.fields.city}
            />

            <FormTextField
              control={control}
              name="address.street"
              label={HebrewTexts.fields.street}
            />
          </Box>

          <Box sx={threeColumnRowStyle}>
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

          <Box>
            <Button
              type="submit"
              variant="contained"
              loading={isSaving}
              disabled={!hasUnsavedChanges}
            >
              {HebrewTexts.profile.saveChanges}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
