import Box from '@mui/material/Box';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PostAddIcon from '@mui/icons-material/PostAdd';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { LibraryLoanStatistics, LoanResponse } from '@library/shared';
import { StatCard } from '../../components/data-display/StatCard';
import { StatCardsGrid } from '../../components/data-display/StatCardsGrid';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { DashboardLoansCard } from './DashboardLoansCard';

const { dashboard: texts } = HebrewTexts;

type StaffDashboardViewProps = {
  statistics: LibraryLoanStatistics;
  overdueLoans: LoanResponse[];
  pendingReturnLoans: LoanResponse[];
};

// Librarian (and the top of the admin dashboard): loan counts and today's desk work
export function StaffDashboardView({
  statistics,
  overdueLoans,
  pendingReturnLoans,
}: StaffDashboardViewProps) {
  return (
    <>
      <StatCardsGrid>
        <StatCard
          label={texts.openLoans}
          value={statistics.openLoans}
          icon={<MenuBookIcon fontSize="large" />}
        />

        <StatCard
          label={texts.overdueLoans}
          value={statistics.overdueLoans}
          highlightColor={statistics.overdueLoans > 0 ? 'error.main' : undefined}
          icon={<WarningAmberIcon fontSize="large" />}
        />

        <StatCard
          label={texts.pendingReturns}
          value={statistics.pendingReturns}
          highlightColor={statistics.pendingReturns > 0 ? 'warning.main' : undefined}
          icon={<AssignmentReturnIcon fontSize="large" />}
        />

        <StatCard
          label={texts.loansCreatedToday}
          value={statistics.loansCreatedToday}
          icon={<PostAddIcon fontSize="large" />}
        />

        <StatCard
          label={texts.returnsProcessedToday}
          value={statistics.returnsProcessedToday}
          icon={<AssignmentTurnedInIcon fontSize="large" />}
        />
      </StatCardsGrid>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '1fr 1fr',
          },
          gap: 3,
          mb: 3,
        }}
      >
        <DashboardLoansCard
          title={texts.mostOverdueTitle}
          loans={overdueLoans}
          emptyMessage={texts.noOverdueLoans}
          viewAllLabel={texts.viewAllLoans}
          showMember
        />

        <DashboardLoansCard
          title={texts.pendingReturnsTitle}
          loans={pendingReturnLoans}
          emptyMessage={texts.noPendingReturns}
          viewAllLabel={texts.viewAllLoans}
          showMember
        />
      </Box>
    </>
  );
}
