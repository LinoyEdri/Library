import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { z } from 'zod';
import { updateOwnProfileSchema, type SafeUserResponse } from '@library/shared';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { QueryKeys } from '../../../constants/query-keys';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { useNotification } from '../../../hooks/useNotification';
import { profileApi } from '../../../services/profile.api';
import { applyServerFieldErrors } from '../../../utils/apply-server-field-errors';
import { getHebrewErrorMessage } from '../../../utils/get-hebrew-error-message';

type PersonalDetailsFormInput = z.input<typeof updateOwnProfileSchema>;
type PersonalDetailsFormOutput = z.output<typeof updateOwnProfileSchema>;

// Current user -> form values (null postal code becomes an empty field)
const toFormValues = (user: SafeUserResponse | null): PersonalDetailsFormInput => ({
  firstName: user?.firstName ?? '',
  lastName: user?.lastName ?? '',
  phoneNumber: user?.phoneNumber ?? '',
  address: {
    street: user?.address.street ?? '',
    houseNumber: user?.address.houseNumber ?? '',
    apartmentOrUnit: user?.address.apartmentOrUnit ?? '',
    city: user?.address.city ?? '',
    postalCode: user?.address.postalCode ?? undefined,
    country: user?.address.country,
  },
});

// Edit name, phone and address; on success the header and profile show the new values at once
export const usePersonalDetailsForm = () => {
  const { currentUser } = useAuthentication();

  const queryClient = useQueryClient();

  const { showNotification } = useNotification();

  const { control, handleSubmit, setError, reset, formState } = useForm<
    PersonalDetailsFormInput,
    unknown,
    PersonalDetailsFormOutput
  >({
    resolver: zodResolver(updateOwnProfileSchema),
    defaultValues: toFormValues(currentUser),
  });

  const updateProfileMutation = useMutation({ mutationFn: profileApi.updateOwnProfile });

  const submitPersonalDetails = handleSubmit(async (profile) => {
    try {
      const updatedUser = await updateProfileMutation.mutateAsync(profile);

      queryClient.setQueryData(QueryKeys.CURRENT_USER, updatedUser);

      reset(toFormValues(updatedUser));

      showNotification(HebrewTexts.profile.profileUpdated);
    } catch (error) {
      if (!applyServerFieldErrors(error, setError)) {
        showNotification(getHebrewErrorMessage(error), 'error');
      }
    }
  });

  return {
    control,
    submitPersonalDetails,
    isSaving: updateProfileMutation.isPending,
    hasUnsavedChanges: formState.isDirty,
  };
};
