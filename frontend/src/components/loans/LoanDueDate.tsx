import Typography from '@mui/material/Typography';
import type { LoanResponse } from '@library/shared';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { formatDate } from '../../utils/format-date';

// The due date, in red with a "late" note while an open loan is past it
export function LoanDueDate({ loan }: { loan: LoanResponse }) {
  return (
    <Typography
      component="span"
      variant="body2"
      color={loan.isPastDue ? 'error' : 'inherit'}
      sx={{
        fontWeight: loan.isPastDue ? 600 : undefined,
      }}
    >
      {formatDate(loan.dueDate)}
      {loan.isPastDue && ` (${HebrewTexts.loans.pastDue})`}
    </Typography>
  );
}
