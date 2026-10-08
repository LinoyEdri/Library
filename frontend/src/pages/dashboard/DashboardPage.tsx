import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { DashboardKind } from '@library/shared';
import { LoadErrorAlert } from '../../components/feedback/LoadErrorAlert';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { AdminTotalsSection } from './AdminTotalsSection';
import { MemberDashboardView } from './MemberDashboardView';
import { RecentAuditEntriesCard } from './RecentAuditEntriesCard';
import { StaffDashboardView } from './StaffDashboardView';
import { useDashboardPage } from './hooks/useDashboardPage';

const { dashboard: texts } = HebrewTexts;

// Home page: a greeting, then the member, librarian or admin dashboard
export function DashboardPage() {
  const dashboardPage = useDashboardPage();

  const { dashboard } = dashboardPage;

  return (
    <>
      <Typography
        variant="h1"
        sx={{
          mb: 3,
        }}
      >
        {texts.welcome} {dashboardPage.firstName}
      </Typography>

      {dashboardPage.isLoading && <LinearProgress />}

      {dashboardPage.loadError && (
        <LoadErrorAlert
          error={dashboardPage.loadError}
          notFoundMessage={texts.loadFailed}
          onRetry={dashboardPage.retryLoad}
        />
      )}

      {dashboard?.kind === DashboardKind.MEMBER && <MemberDashboardView dashboard={dashboard} />}

      {dashboard && dashboard.kind !== DashboardKind.MEMBER && (
        <StaffDashboardView
          statistics={dashboard.statistics}
          overdueLoans={dashboard.overdueLoans}
          pendingReturnLoans={dashboard.pendingReturnLoans}
        />
      )}

      {dashboard?.kind === DashboardKind.ADMIN && (
        <>
          <AdminTotalsSection totals={dashboard.totals} />

          <RecentAuditEntriesCard entries={dashboard.recentAuditEntries} />
        </>
      )}
    </>
  );
}
