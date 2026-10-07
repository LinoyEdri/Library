import { Link as RouterLink } from 'react-router';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { DashboardAuditEntry } from '@library/shared';
import { RoleChip } from '../../components/data-display/RoleChip';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { RoutePaths } from '../../constants/route-paths';
import { formatDateTime } from '../../utils/format-date-time';

const { dashboard: texts } = HebrewTexts;

// Admin: the newest audit log entries (who did what, and when)
export function RecentAuditEntriesCard({ entries }: { entries: DashboardAuditEntry[] }) {
  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              flexGrow: 1,
            }}
          >
            {texts.recentActivityTitle}
          </Typography>

          <Button
            component={RouterLink}
            to={RoutePaths.AUDIT_LOGS}
            size="small"
          >
            {HebrewTexts.auditLogs.viewAllActivity}
          </Button>
        </Box>

        {entries.length === 0 ? (
          <Typography color="text.secondary">{texts.noRecentActivity}</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{texts.timeColumn}</TableCell>

                  <TableCell>{texts.userColumn}</TableCell>

                  <TableCell>{texts.actionColumn}</TableCell>

                  <TableCell>{texts.recordTypeColumn}</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDateTime(entry.createdDate)}</TableCell>

                    <TableCell>
                      {entry.actionUser.firstName} {entry.actionUser.lastName}{' '}
                      <RoleChip role={entry.actionUserRole} />
                    </TableCell>

                    <TableCell>{HebrewTexts.actionTypes[entry.actionType]}</TableCell>

                    <TableCell>{HebrewTexts.entityTypes[entry.affectedType]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}
