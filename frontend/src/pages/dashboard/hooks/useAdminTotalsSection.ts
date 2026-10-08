import { CopyStatus, Role, type LibraryTotals } from '@library/shared';
import type { CountBreakdownRow } from '../../../components/data-display/CountBreakdownCard';
import { HebrewTexts } from '../../../constants/hebrew-texts';

// Turns the totals into Hebrew-labelled rows (users per role, copies per status)
export const useAdminTotalsSection = (totals: LibraryTotals) => {
  const userRows: CountBreakdownRow[] = Object.values(Role).map((role) => ({
    label: HebrewTexts.roles[role],
    count: totals.activeUsersByRole[role],
  }));

  const copyRows: CountBreakdownRow[] = Object.values(CopyStatus).map((copyStatus) => ({
    label: HebrewTexts.copyStatuses[copyStatus],
    count: totals.copiesByStatus[copyStatus],
  }));

  return {
    userRows,
    copyRows,
  };
};
