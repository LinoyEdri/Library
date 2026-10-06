import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { memberDetailsSchema, type MemberResponse } from '@library/shared';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { useNotification } from '../../../hooks/useNotification';
import { membersApi } from '../../../services/members.api';
import { applyServerFieldErrors } from '../../../utils/apply-server-field-errors';
import { getHebrewErrorMessage } from '../../../utils/get-hebrew-error-message';
import { useSaveMemberMutation } from './useSaveMemberMutation';

type MemberDetailsFormInput = z.input<typeof memberDetailsSchema>;
type MemberDetailsFormOutput = z.output<typeof memberDetailsSchema>;

// Member -> form values (a missing postal code becomes an empty field)
const toFormValues = (member: MemberResponse): MemberDetailsFormInput => ({
  firstName: member.firstName,
  lastName: member.lastName,
  phoneNumber: member.phoneNumber,
  address: {
    street: member.address.street,
    houseNumber: member.address.houseNumber,
    apartmentOrUnit: member.address.apartmentOrUnit,
    city: member.address.city,
    postalCode: member.address.postalCode ?? undefined,
    country: member.address.country,
  },
});

// Edits a member's name, phone and address
export const useEditMemberForm = (editedMember: MemberResponse) => {
  const { showNotification } = useNotification();

  const { control, handleSubmit, setError } = useForm<
    MemberDetailsFormInput,
    unknown,
    MemberDetailsFormOutput
  >({
    resolver: zodResolver(memberDetailsSchema),
    defaultValues: toFormValues(editedMember),
  });

  const saveMutation = useSaveMemberMutation(
    (details: MemberDetailsFormOutput) => membersApi.update(editedMember.id, details),
    HebrewTexts.members.memberUpdated,
  );

  const submitMemberDetails = handleSubmit(async (details) => {
    try {
      await saveMutation.mutateAsync(details);
    } catch (error) {
      if (!applyServerFieldErrors(error, setError)) {
        showNotification(getHebrewErrorMessage(error), 'error');
      }
    }
  });

  return {
    control,
    submitMemberDetails,
    isSaving: saveMutation.isPending,
  };
};
