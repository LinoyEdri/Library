import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

// One "label: count" line
export interface CountBreakdownRow {
  label: string;
  count: number;
}

// A titled list of counts, e.g. users per role
export function CountBreakdownCard({ title, rows }: { title: string; rows: CountBreakdownRow[] }) {
  return (
    <Card>
      <CardContent>
        <Typography
          variant="h3"
          sx={{
            mb: 1.5,
          }}
        >
          {title}
        </Typography>

        {rows.map((row) => (
          <Box
            key={row.label}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              py: 0.5,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Typography color="text.secondary">{row.label}</Typography>

            <Typography
              sx={{
                fontWeight: 600,
              }}
            >
              {row.count}
            </Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
