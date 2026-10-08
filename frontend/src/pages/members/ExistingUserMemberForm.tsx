import { Controller } from 'react-hook-form';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SingleReferenceAutocomplete } from '../../components/catalog-reference/SingleReferenceAutocomplete';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { RoutePaths } from '../../constants/route-paths';
import { FormActions } from '../../components/forms/FormActions';
import { useExistingUserMemberForm } from './hooks/useExistingUserMemberForm';
import { memberCandidateOptionSource } from './member-candidate-option-source';

// Pick an existing guest account and make it a member
export function ExistingUserMemberForm() {
  const { control, submitExistingUser, isSaving } = useExistingUserMemberForm();

  return (
    <Stack
      component="form"
      spacing={2}
      noValidate
      onSubmit={submitExistingUser}
    >
      <Controller
        control={control}
        name="user"
        render={({ field, fieldState }) => (
          <SingleReferenceAutocomplete
            source={memberCandidateOptionSource}
            label={HebrewTexts.members.existingUserField}
            value={field.value}
            onChange={field.onChange}
            errorMessage={fieldState.error?.message}
          />
        )}
      />

      <Typography
        variant="body2"
        color="text.secondary"
      >
        {HebrewTexts.members.existingUserHelp}
      </Typography>

      <FormActions
        isSaving={isSaving}
        cancelPath={RoutePaths.MEMBERS}
      />
    </Stack>
  );
}
