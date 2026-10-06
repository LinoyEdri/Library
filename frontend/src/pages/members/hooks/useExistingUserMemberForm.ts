import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { useNotification } from '../../../hooks/useNotification';
import { ApiRequestError } from '../../../services/api-request-error';
import { membersApi } from '../../../services/members.api';
import { getHebrewErrorMessage } from '../../../utils/get-hebrew-error-message';
import { useSaveMemberMutation } from './useSaveMemberMutation';

// The picker holds the chosen account as { id, label }
const existingUserFormSchema = z.object({
  user: z
    .object({
      id: z.string(),
      label: z.string(),
    })
    .nullable()
    .refine((user) => user !== null, { message: HebrewTexts.members.existingUserRequired }),
});

type ExistingUserFormInput = z.input<typeof existingUserFormSchema>;
type ExistingUserFormOutput = z.output<typeof existingUserFormSchema>;

// Status code -> message shown under the picker
const pickerErrorByStatus: Partial<Record<number, string>> = {
  [StatusCodes.CONFLICT]: HebrewTexts.members.alreadyMember,
  [StatusCodes.BAD_REQUEST]: HebrewTexts.members.notEligible,
};

// Turns an existing guest account into a member
export const useExistingUserMemberForm = () => {
  const { showNotification } = useNotification();

  const { control, handleSubmit, setError } = useForm<
    ExistingUserFormInput,
    unknown,
    ExistingUserFormOutput
  >({
    resolver: zodResolver(existingUserFormSchema),
    defaultValues: { user: null },
  });

  const saveMutation = useSaveMemberMutation(
    (userId: string) => membersApi.create({ mode: 'existingUser', userId }),
    HebrewTexts.members.memberCreated,
  );

  const submitExistingUser = handleSubmit(async ({ user }) => {
    try {
      await saveMutation.mutateAsync(user?.id ?? '');
    } catch (error) {
      const pickerError =
        error instanceof ApiRequestError ? pickerErrorByStatus[error.statusCode] : undefined;

      if (pickerError) {
        setError('user', { message: pickerError });
        return;
      }

      showNotification(getHebrewErrorMessage(error), 'error');
    }
  });

  return {
    control,
    submitExistingUser,
    isSaving: saveMutation.isPending,
  };
};
