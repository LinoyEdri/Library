import { HebrewTexts } from '../../constants/hebrew-texts';
import { ConfirmActionDialog } from '../feedback/ConfirmActionDialog';
import type { LoanActions } from './hooks/useLoanActions';
import { ProcessReturnDialog } from './ProcessReturnDialog';

const { loans: texts } = HebrewTexts;

// The dialogs opened by the loan action buttons (process return, cancel loan)
export function LoanActionDialogs({ loanActions }: { loanActions: LoanActions }) {
  const { loanToProcess, loanToCancel } = loanActions;

  return (
    <>
      {loanToProcess && (
        <ProcessReturnDialog
          loan={loanToProcess}
          isSaving={loanActions.isProcessingReturn}
          onConfirm={loanActions.confirmProcessReturn}
          onClose={loanActions.closeProcessReturn}
        />
      )}

      <ConfirmActionDialog
        isOpen={loanToCancel !== null}
        title={texts.cancelLoan}
        message={texts.cancelLoanConfirmationText.replace(
          '{title}',
          loanToCancel?.book.title ?? '',
        )}
        isConfirming={loanActions.isCancellingLoan}
        onConfirm={loanActions.confirmCancelLoan}
        onCancel={loanActions.closeCancelLoan}
      />
    </>
  );
}
