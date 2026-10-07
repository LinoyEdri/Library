import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { MemberDashboardResponse } from '@library/shared';
import { StatCard } from '../../components/data-display/StatCard';
import { StatCardsGrid } from '../../components/data-display/StatCardsGrid';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { DashboardLoansCard } from './DashboardLoansCard';

const { dashboard: texts } = HebrewTexts;

// Member: my loan counts against the limit, then every loan I still hold
export function MemberDashboardView({ dashboard }: { dashboard: MemberDashboardResponse }) {
  const { statistics } = dashboard;

  return (
    <>
      <StatCardsGrid>
        <StatCard
          label={texts.openLoans}
          value={statistics.openLoans}
          caption={texts.loanLimitCaption(statistics.maxActiveLoans)}
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
          icon={<AssignmentReturnIcon fontSize="large" />}
        />
      </StatCardsGrid>

      <DashboardLoansCard
        title={texts.myOpenLoansTitle}
        loans={dashboard.openLoans}
        emptyMessage={texts.noOpenLoans}
        viewAllLabel={texts.viewAllMyLoans}
        showMember={false}
      />
    </>
  );
}
