import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import type { LoanResponse } from '@library/shared';
import { HebrewTexts } from '../../constants/hebrew-texts';
import type { LoanActions } from './hooks/useLoanActions';

const { loans: texts } = HebrewTexts;

type LoanActionButtonsProps = {
  loan: LoanResponse;
  loanActions: LoanActions;
  size?: 'small' | 'medium';
};

// The buttons this user may use on this loan (clicks never open the row behind them)
export function LoanActionButtons({ loan, loanActions, size = 'small' }: LoanActionButtonsProps) {
  const availableActions = loanActions.getAvailableActions(loan);

  return (
    <Box
      onClick={(event) => event.stopPropagation()}
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      {availableActions.canRequestReturn && (
        <Button
          size={size}
          variant="contained"
          disabled={loanActions.isActionPending}
          onClick={() => loanActions.requestReturn(loan)}
        >
          {texts.requestReturn}
        </Button>
      )}

      {availableActions.canCancelReturnRequest && (
        <Button
          size={size}
          variant="outlined"
          disabled={loanActions.isActionPending}
          onClick={() => loanActions.cancelReturnRequest(loan)}
        >
          {texts.cancelReturnRequest}
        </Button>
      )}

      {availableActions.canProcessReturn && (
        <Button
          size={size}
          variant="contained"
          color="secondary"
          onClick={() => loanActions.openProcessReturn(loan)}
        >
          {texts.processReturn}
        </Button>
      )}

      {availableActions.canCancelLoan && (
        <Button
          size={size}
          color="error"
          onClick={() => loanActions.openCancelLoan(loan)}
        >
          {texts.cancelLoan}
        </Button>
      )}
    </Box>
  );
}
