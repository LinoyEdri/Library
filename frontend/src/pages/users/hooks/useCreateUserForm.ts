import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { createUserSchema, Role } from '@library/shared';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { usersApi } from '../../../services/users.api';
import { useSaveUserMutation } from './useSaveUserMutation';
import { useUserFormSubmitErrorHandler } from './useUserFormSubmitErrorHandler';

type CreateUserFormInput = z.input<typeof createUserSchema>;
type CreateUserFormOutput = z.output<typeof createUserSchema>;

const emptyUserValues: CreateUserFormInput = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  role: Role.LIBRARIAN,
  address: {
    street: '',
    houseNumber: '',
    apartmentOrUnit: '',
    city: '',
  },
};

// New account with a role and an initial password
export const useCreateUserForm = () => {
  const { control, handleSubmit, setError } = useForm<
    CreateUserFormInput,
    unknown,
    CreateUserFormOutput
  >({
    resolver: zodResolver(createUserSchema),
    defaultValues: emptyUserValues,
  });

  const selectedRole = useWatch({ control, name: 'role' });

  const handleSubmitError = useUserFormSubmitErrorHandler(setError);

  const saveMutation = useSaveUserMutation(usersApi.create, HebrewTexts.users.userCreated);

  const submitNewUser = handleSubmit(async (newUser) => {
    try {
      await saveMutation.mutateAsync(newUser);
    } catch (error) {
      handleSubmitError(error);
    }
  });

  return {
    control,
    submitNewUser,
    isSaving: saveMutation.isPending,
    // Members also get a membership; the form says so when MEMBER is chosen
    isMemberRoleSelected: selectedRole === Role.MEMBER,
  };
};
