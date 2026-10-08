import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StatusCodes } from 'http-status-codes';
import type { z } from 'zod';
import { createMemberWithNewPersonSchema } from '@library/shared';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { useNotification } from '../../../hooks/useNotification';
import { ApiRequestError } from '../../../services/api-request-error';
import { membersApi } from '../../../services/members.api';
import { applyServerFieldErrors } from '../../../utils/apply-server-field-errors';
import { getHebrewErrorMessage } from '../../../utils/get-hebrew-error-message';
import { useSaveMemberMutation } from './useSaveMemberMutation';

type NewPersonFormInput = z.input<typeof createMemberWithNewPersonSchema>;
type NewPersonFormOutput = z.output<typeof createMemberWithNewPersonSchema>;

const emptyNewPersonValues: NewPersonFormInput = {
  mode: 'newPerson',
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  address: {
    street: '',
    houseNumber: '',
    city: '',
  },
};

// A new person: account details, initial password and address
export const useNewPersonMemberForm = () => {
  const { showNotification } = useNotification();

  const { control, handleSubmit, setError } = useForm<
    NewPersonFormInput,
    unknown,
    NewPersonFormOutput
  >({
    resolver: zodResolver(createMemberWithNewPersonSchema),
    defaultValues: emptyNewPersonValues,
  });

  const saveMutation = useSaveMemberMutation(membersApi.create, HebrewTexts.members.memberCreated);

  const submitNewPerson = handleSubmit(async (newPerson) => {
    try {
      await saveMutation.mutateAsync(newPerson);
    } catch (error) {
      if (error instanceof ApiRequestError && error.statusCode === StatusCodes.CONFLICT) {
        setError('email', { message: HebrewTexts.authentication.emailAlreadyRegistered });
        return;
      }

      if (!applyServerFieldErrors(error, setError)) {
        showNotification(getHebrewErrorMessage(error), 'error');
      }
    }
  });

  return {
    control,
    submitNewPerson,
    isSaving: saveMutation.isPending,
  };
};
