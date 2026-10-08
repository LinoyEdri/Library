import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import GroupIcon from '@mui/icons-material/Group';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import type { LibraryTotals } from '@library/shared';
import { CountBreakdownCard } from '../../components/data-display/CountBreakdownCard';
import { StatCard } from '../../components/data-display/StatCard';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { useAdminTotalsSection } from './hooks/useAdminTotalsSection';

const { dashboard: texts } = HebrewTexts;

// Admin: the library in numbers (books, members, users per role, copies per status)
export function AdminTotalsSection({ totals }: { totals: LibraryTotals }) {
  const { userRows, copyRows } = useAdminTotalsSection(totals);

  return (
    <>
      <Typography
        variant="h2"
        sx={{
          mb: 2,
        }}
      >
        {texts.libraryTotalsTitle}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2,
          alignItems: 'start',
          mb: 3,
        }}
      >
        <StatCard
          label={texts.activeBooks}
          value={totals.activeBooks}
          icon={<LibraryBooksIcon fontSize="large" />}
        />

        <StatCard
          label={texts.activeMembers}
          value={totals.activeMembers}
          icon={<GroupIcon fontSize="large" />}
        />

        <CountBreakdownCard
          title={texts.activeUsersByRole}
          rows={userRows}
        />

        <CountBreakdownCard
          title={texts.copiesByStatus}
          rows={copyRows}
        />
      </Box>
    </>
  );
}
