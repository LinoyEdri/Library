import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// One "label: value" line in a details page
export function InformationRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        py: 0.5,
      }}
    >
      <Typography
        color="text.secondary"
        sx={{
          minWidth: 110,
        }}
      >
        {label}
      </Typography>

      <Typography component="div">{value}</Typography>
    </Box>
  );
}
