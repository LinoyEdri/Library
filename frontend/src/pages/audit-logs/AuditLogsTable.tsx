import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { RoleChip } from '../../components/data-display/RoleChip';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { formatDateTime } from '../../utils/format-date-time';
import type { AuditLogsPageState } from './hooks/useAuditLogsPage';

const { auditLogs: texts } = HebrewTexts;

const PAGE_SIZE_OPTIONS = [20, 50, 100];

const COLUMN_COUNT = 6;

// Paged audit entries, newest first; a row opens the entry's details
export function AuditLogsTable({ page }: { page: AuditLogsPageState }) {
  return (
    <Card>
      {page.isLoading && <LinearProgress />}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{texts.entryNumberColumn}</TableCell>

              <TableCell>{texts.timeColumn}</TableCell>

              <TableCell>{texts.userColumn}</TableCell>

              <TableCell>{texts.actionColumn}</TableCell>

              <TableCell>{texts.recordTypeColumn}</TableCell>

              <TableCell>{texts.recordColumn}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {page.entryRows.map(({ entry, recordLabel }) => (
              <TableRow
                key={entry.id}
                hover
                selected={page.openedEntry?.id === entry.id}
                onClick={() => page.openEntry(entry)}
                sx={{
                  cursor: 'pointer',
                }}
              >
                <TableCell>{entry.entryNumber}</TableCell>

                <TableCell
                  sx={{
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatDateTime(entry.createdDate)}
                </TableCell>

                <TableCell>
                  {entry.actionUser.firstName} {entry.actionUser.lastName}{' '}
                  <RoleChip role={entry.actionUserRole} />
                </TableCell>

                <TableCell>{HebrewTexts.actionTypes[entry.actionType]}</TableCell>

                <TableCell>{HebrewTexts.entityTypes[entry.affectedType]}</TableCell>

                <TableCell>{recordLabel}</TableCell>
              </TableRow>
            ))}

            {!page.isLoading && page.entryRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={COLUMN_COUNT}>
                  <Typography
                    color="text.secondary"
                    sx={{
                      py: 3,
                      textAlign: 'center',
                    }}
                  >
                    {texts.noEntries}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={page.totalItems}
        page={page.paging.pageIndex}
        onPageChange={(_event, newPageIndex) => page.paging.setPageIndex(newPageIndex)}
        rowsPerPage={page.paging.pageSize}
        onRowsPerPageChange={(event) => page.paging.changePageSize(Number(event.target.value))}
        rowsPerPageOptions={PAGE_SIZE_OPTIONS}
        labelRowsPerPage={HebrewTexts.common.rowsPerPage}
        labelDisplayedRows={({ from, to, count }) =>
          HebrewTexts.common.displayedRows(from, to, count)
        }
      />
    </Card>
  );
}
