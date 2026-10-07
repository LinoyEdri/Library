import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LoanStatus,
  Permission,
  type LoanResponse,
  type ReturnCopyCondition,
} from '@library/shared';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { QueryKeys } from '../../../constants/query-keys';
import { useCan } from '../../../hooks/useCan';
import { useNotification } from '../../../hooks/useNotification';
import { loansApi } from '../../../services/loans.api';
import { getLoanErrorMessage } from '../../../utils/get-loan-error-message';

const { loans: texts } = HebrewTexts;

const OPEN_LOAN_STATUSES: LoanStatus[] = [
  LoanStatus.ACTIVE,
  LoanStatus.OVERDUE,
  LoanStatus.RETURN_REQUESTED,
];

// Which buttons a loan gets for the current user
export interface AvailableLoanActions {
  canRequestReturn: boolean;
  canCancelReturnRequest: boolean;
  canProcessReturn: boolean;
  canCancelLoan: boolean;
}

// Loan actions shared by the list, the details page and the member's loans tab:
// member return requests, staff return processing and cancellation (with their dialogs)
export const useLoanActions = () => {
  const queryClient = useQueryClient();

  const { showNotification } = useNotification();

  const hasRequestReturnPermission = useCan(Permission.LOANS_REQUEST_RETURN);
  const hasProcessReturnPermission = useCan(Permission.LOANS_PROCESS_RETURN);

  const [loanToProcess, setLoanToProcess] = useState<LoanResponse | null>(null);
  const [loanToCancel, setLoanToCancel] = useState<LoanResponse | null>(null);

  // Loans and book availability both change after every action
  const refreshAfterChange = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: QueryKeys.LOANS }),
      queryClient.invalidateQueries({ queryKey: QueryKeys.BOOKS }),
    ]);

  const buildMutationCallbacks = (successMessage: string, closeDialog?: () => void) => ({
    onSuccess: () => {
      closeDialog?.();
      showNotification(successMessage);
      return refreshAfterChange();
    },
    onError: (error: unknown) => showNotification(getLoanErrorMessage(error), 'error'),
  });

  const requestReturnMutation = useMutation({
    mutationFn: (loanId: string) => loansApi.requestReturn(loanId),
    ...buildMutationCallbacks(texts.returnRequested),
  });

  const cancelReturnRequestMutation = useMutation({
    mutationFn: (loanId: string) => loansApi.cancelReturnRequest(loanId),
    ...buildMutationCallbacks(texts.returnRequestCancelled),
  });

  const processReturnMutation = useMutation({
    mutationFn: ({
      loanId,
      copyCondition,
    }: {
      loanId: string;
      copyCondition: ReturnCopyCondition;
    }) => loansApi.processReturn(loanId, { copyCondition }),
    ...buildMutationCallbacks(texts.returnProcessed, () => setLoanToProcess(null)),
  });

  const cancelLoanMutation = useMutation({
    mutationFn: (loanId: string) => loansApi.cancel(loanId),
    ...buildMutationCallbacks(texts.loanCancelled, () => setLoanToCancel(null)),
  });

  const getAvailableActions = (loan: LoanResponse): AvailableLoanActions => {
    const isOpen = OPEN_LOAN_STATUSES.includes(loan.status);

    return {
      canRequestReturn:
        hasRequestReturnPermission &&
        (loan.status === LoanStatus.ACTIVE || loan.status === LoanStatus.OVERDUE),
      canCancelReturnRequest:
        hasRequestReturnPermission && loan.status === LoanStatus.RETURN_REQUESTED,
      canProcessReturn: hasProcessReturnPermission && isOpen,
      canCancelLoan: hasProcessReturnPermission && isOpen,
    };
  };

  return {
    getAvailableActions,
    isActionPending: requestReturnMutation.isPending || cancelReturnRequestMutation.isPending,
    requestReturn: (loan: LoanResponse) => requestReturnMutation.mutate(loan.id),
    cancelReturnRequest: (loan: LoanResponse) => cancelReturnRequestMutation.mutate(loan.id),

    loanToProcess,
    openProcessReturn: setLoanToProcess,
    closeProcessReturn: () => setLoanToProcess(null),
    confirmProcessReturn: (copyCondition: ReturnCopyCondition) =>
      loanToProcess && processReturnMutation.mutate({ loanId: loanToProcess.id, copyCondition }),
    isProcessingReturn: processReturnMutation.isPending,

    loanToCancel,
    openCancelLoan: setLoanToCancel,
    closeCancelLoan: () => setLoanToCancel(null),
    confirmCancelLoan: () => loanToCancel && cancelLoanMutation.mutate(loanToCancel.id),
    isCancellingLoan: cancelLoanMutation.isPending,
  };
};

export type LoanActions = ReturnType<typeof useLoanActions>;
