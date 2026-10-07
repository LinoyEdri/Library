import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

type StatCardProps = {
  label: string;
  value: number;
  icon: ReactNode;
  // Small line under the number, e.g. "out of 5 allowed"
  caption?: string;
  // Highlights the number, e.g. red when there are overdue loans
  highlightColor?: 'error.main' | 'warning.main';
};

// One number on a dashboard, with its label and icon
export function StatCard({ label, value, icon, caption, highlightColor }: StatCardProps) {
  return (
    <Card>
      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            color: highlightColor ?? 'primary.main',
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography
            sx={{
              fontSize: '1.75rem',
              fontWeight: 700,
              lineHeight: 1.2,
              color: highlightColor,
            }}
          >
            {value}
          </Typography>

          <Typography color="text.secondary">{label}</Typography>

          {caption && (
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {caption}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
