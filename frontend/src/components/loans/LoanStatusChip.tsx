import Chip, { type ChipProps } from '@mui/material/Chip';
import { LoanStatus } from '@library/shared';
import { HebrewTexts } from '../../constants/hebrew-texts';

// Chip color for each loan status
const chipColorByLoanStatus: Record<LoanStatus, ChipProps['color']> = {
  [LoanStatus.ACTIVE]: 'primary',
  [LoanStatus.RETURN_REQUESTED]: 'warning',
  [LoanStatus.RETURNED]: 'secondary',
  [LoanStatus.OVERDUE]: 'error',
  [LoanStatus.CANCELLED]: 'default',
};

export function LoanStatusChip({ status }: { status: LoanStatus }) {
  return (
    <Chip
      size="small"
      label={HebrewTexts.loanStatuses[status]}
      color={chipColorByLoanStatus[status]}
    />
  );
}
