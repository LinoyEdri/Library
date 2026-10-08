import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { updateUserSchema, type ManagedUserResponse } from '@library/shared';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { usersApi } from '../../../services/users.api';
import { useSaveUserMutation } from './useSaveUserMutation';
import { useUserFormSubmitErrorHandler } from './useUserFormSubmitErrorHandler';

type EditUserFormInput = z.input<typeof updateUserSchema>;
type EditUserFormOutput = z.output<typeof updateUserSchema>;

// User -> form values (a missing postal code becomes an empty field)
const toFormValues = (user: ManagedUserResponse): EditUserFormInput => ({
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phoneNumber: user.phoneNumber,
  address: {
    street: user.address.street,
    houseNumber: user.address.houseNumber,
    apartmentOrUnit: user.address.apartmentOrUnit ?? undefined,
    city: user.address.city,
    postalCode: user.address.postalCode ?? undefined,
    country: user.address.country,
  },
});

// Edits name, email, phone and address (role and status have their own actions)
export const useEditUserForm = (editedUser: ManagedUserResponse) => {
  const { control, handleSubmit, setError } = useForm<
    EditUserFormInput,
    unknown,
    EditUserFormOutput
  >({
    resolver: zodResolver(updateUserSchema),
    defaultValues: toFormValues(editedUser),
  });

  const handleSubmitError = useUserFormSubmitErrorHandler(setError);

  const saveMutation = useSaveUserMutation(
    (details: EditUserFormOutput) => usersApi.update(editedUser.id, details),
    HebrewTexts.users.userUpdated,
  );

  const submitUserDetails = handleSubmit(async (details) => {
    try {
      await saveMutation.mutateAsync(details);
    } catch (error) {
      handleSubmitError(error);
    }
  });

  return {
    control,
    submitUserDetails,
    isSaving: saveMutation.isPending,
  };
};
