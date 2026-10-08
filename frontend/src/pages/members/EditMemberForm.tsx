import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { MemberResponse } from '@library/shared';
import { AddressFormFields } from '../../components/forms/AddressFormFields';
import { FormTextField } from '../../components/forms/FormTextField';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { buildMemberDetailsPath } from '../../utils/build-member-paths';
import { FormActions } from '../../components/forms/FormActions';
import { useEditMemberForm } from './hooks/useEditMemberForm';

const twoColumnRowStyle = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: {
    sm: '1fr 1fr',
  },
};

// Edit a member's name, phone and address (email and password are not changed here)
export function EditMemberForm({ editedMember }: { editedMember: MemberResponse }) {
  const { control, submitMemberDetails, isSaving } = useEditMemberForm(editedMember);

  return (
    <Stack
      component="form"
      spacing={2}
      noValidate
      onSubmit={submitMemberDetails}
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

      <FormTextField
        control={control}
        name="phoneNumber"
        type="tel"
        label={HebrewTexts.fields.phoneNumber}
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
        cancelPath={buildMemberDetailsPath(editedMember.id)}
      />
    </Stack>
  );
}
