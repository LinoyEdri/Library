import type { ReactNode } from 'react';
import Box from '@mui/material/Box';

// Responsive row of stat cards: as many columns as fit, at least 200px each
export function StatCardsGrid({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 2,
        mb: 3,
      }}
    >
      {children}
    </Box>
  );
}
