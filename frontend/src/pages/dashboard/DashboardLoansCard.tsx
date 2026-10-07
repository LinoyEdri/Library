import { Link as RouterLink } from 'react-router';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { LoanResponse } from '@library/shared';
import { LoanDueDate } from '../../components/loans/LoanDueDate';
import { LoanStatusChip } from '../../components/loans/LoanStatusChip';
import { RoutePaths } from '../../constants/route-paths';
import { useDashboardLoansCard } from './hooks/useDashboardLoansCard';

type DashboardLoansCardProps = {
  title: string;
  loans: LoanResponse[];
  emptyMessage: string;
  viewAllLabel: string;
  // Staff see who holds each loan; a member's own list does not need it
  showMember: boolean;
};

// Short list of loans (book, member, due date, status); a row opens the loan
export function DashboardLoansCard({
  title,
  loans,
  emptyMessage,
  viewAllLabel,
  showMember,
}: DashboardLoansCardProps) {
  const { openLoan } = useDashboardLoansCard();

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              flexGrow: 1,
            }}
          >
            {title}
          </Typography>

          <Button
            component={RouterLink}
            to={RoutePaths.LOANS}
            size="small"
          >
            {viewAllLabel}
          </Button>
        </Box>

        {loans.length === 0 ? (
          <Typography
            color="text.secondary"
            sx={{
              py: 2,
            }}
          >
            {emptyMessage}
          </Typography>
        ) : (
          <Table size="small">
            <TableBody>
              {loans.map((loan) => (
                <TableRow
                  key={loan.id}
                  hover
                  onClick={() => openLoan(loan.id)}
                  sx={{
                    cursor: 'pointer',
                  }}
                >
                  <TableCell>{loan.book.title}</TableCell>

                  {showMember && (
                    <TableCell>
                      {loan.member.firstName} {loan.member.lastName}
                    </TableCell>
                  )}

                  <TableCell>
                    <LoanDueDate loan={loan} />
                  </TableCell>

                  <TableCell>
                    <LoanStatusChip status={loan.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
