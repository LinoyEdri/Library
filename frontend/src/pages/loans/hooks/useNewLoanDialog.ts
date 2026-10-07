import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateLoanInput } from '@library/shared';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { QueryKeys } from '../../../constants/query-keys';
import { useNotification } from '../../../hooks/useNotification';
import { loansApi } from '../../../services/loans.api';
import { getLoanErrorMessage } from '../../../utils/get-loan-error-message';
import {
  newLoanFormSchema,
  type NewLoanFormInput,
  type NewLoanFormOutput,
} from '../new-loan-form.schema';

const emptyNewLoanForm: NewLoanFormInput = {
  member: null,
  book: null,
  barcode: '',
};

// Form values -> POST /loans body (an empty barcode means "any free copy of the book")
const toCreateLoanInput = (values: NewLoanFormOutput): CreateLoanInput => ({
  memberId: values.member?.id ?? '',
  bookId: values.book?.id,
  barcode: values.barcode || undefined,
});

// New loan dialog: pick a member and a book (or scan a barcode); broken rules show inside the dialog
export const useNewLoanDialog = (onClose: () => void) => {
  const queryClient = useQueryClient();

  const { showNotification } = useNotification();

  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<NewLoanFormInput, unknown, NewLoanFormOutput>({
    resolver: zodResolver(newLoanFormSchema),
    defaultValues: emptyNewLoanForm,
  });

  const createMutation = useMutation({
    mutationFn: (loan: CreateLoanInput) => loansApi.create(loan),
  });

  const submitForm = handleSubmit(async (values) => {
    setSubmitErrorMessage(null);

    try {
      await createMutation.mutateAsync(toCreateLoanInput(values));

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QueryKeys.LOANS }),
        queryClient.invalidateQueries({ queryKey: QueryKeys.BOOKS }),
      ]);

      showNotification(HebrewTexts.loans.loanCreated);

      onClose();
    } catch (error) {
      setSubmitErrorMessage(getLoanErrorMessage(error));
    }
  });

  return {
    control,
    submitForm,
    isSaving: createMutation.isPending,
    submitErrorMessage,
  };
};
