import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { LoanResponse } from '@library/shared';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { formatDate } from '../../utils/format-date';
import type { LoanActions } from './hooks/useLoanActions';
import { LoanActionButtons } from './LoanActionButtons';
import { LoanDueDate } from './LoanDueDate';
import { LoanStatusChip } from './LoanStatusChip';

const { loans: texts } = HebrewTexts;

const PAGE_SIZE_OPTIONS = [10, 20, 50];

type LoansTableProps = {
  loans: LoanResponse[];
  totalItems: number;
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  onPageIndexChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  // Hidden where every loan belongs to the same member
  showMemberColumn: boolean;
  loanActions: LoanActions;
  onOpenLoan: (loanId: string) => void;
};

// Paged loans table with status, due date and the user's actions; a row click opens the loan
export function LoansTable({
  loans,
  totalItems,
  isLoading,
  pageIndex,
  pageSize,
  onPageIndexChange,
  onPageSizeChange,
  showMemberColumn,
  loanActions,
  onOpenLoan,
}: LoansTableProps) {
  const columnCount = showMemberColumn ? 7 : 6;

  return (
    <Card>
      {isLoading && <LinearProgress />}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{texts.bookColumn}</TableCell>

              {showMemberColumn && <TableCell>{texts.memberColumn}</TableCell>}

              <TableCell>{texts.barcodeColumn}</TableCell>

              <TableCell>{texts.loanDateColumn}</TableCell>

              <TableCell>{texts.dueDateColumn}</TableCell>

              <TableCell>{texts.statusColumn}</TableCell>

              <TableCell>{texts.actionsColumn}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loans.map((loan) => (
              <TableRow
                key={loan.id}
                hover
                onClick={() => onOpenLoan(loan.id)}
                sx={{
                  cursor: 'pointer',
                }}
              >
                <TableCell>{loan.book.title}</TableCell>

                {showMemberColumn && (
                  <TableCell>
                    {loan.member.firstName} {loan.member.lastName}
                  </TableCell>
                )}

                <TableCell>{loan.copy.barcode}</TableCell>

                <TableCell>{formatDate(loan.createdDate)}</TableCell>

                <TableCell>
                  <LoanDueDate loan={loan} />
                </TableCell>

                <TableCell>
                  <LoanStatusChip status={loan.status} />
                </TableCell>

                <TableCell>
                  <LoanActionButtons
                    loan={loan}
                    loanActions={loanActions}
                  />
                </TableCell>
              </TableRow>
            ))}

            {!isLoading && loans.length === 0 && (
              <TableRow>
                <TableCell colSpan={columnCount}>
                  <Typography
                    color="text.secondary"
                    sx={{
                      py: 3,
                      textAlign: 'center',
                    }}
                  >
                    {texts.noLoans}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalItems}
        page={pageIndex}
        onPageChange={(_event, newPageIndex) => onPageIndexChange(newPageIndex)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(event) => onPageSizeChange(Number(event.target.value))}
        rowsPerPageOptions={PAGE_SIZE_OPTIONS}
        labelRowsPerPage={HebrewTexts.common.rowsPerPage}
        labelDisplayedRows={({ from, to, count }) =>
          HebrewTexts.common.displayedRows(from, to, count)
        }
      />
    </Card>
  );
}
