import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { HebrewTexts } from '../../constants/hebrew-texts';
import type { AuditValueComparisonRow } from './audit-value-row.types';

const { auditLogs: texts } = HebrewTexts;

// Field | before | after, with changed fields highlighted
export function AuditValueComparisonTable({ rows }: { rows: AuditValueComparisonRow[] }) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>{texts.fieldColumn}</TableCell>

          <TableCell>{texts.previousValueColumn}</TableCell>

          <TableCell>{texts.newValueColumn}</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {rows.map((row) => (
          <TableRow
            key={row.fieldPath}
            sx={{
              backgroundColor: row.isChanged ? 'action.selected' : undefined,
            }}
          >
            <TableCell
              sx={{
                fontWeight: row.isChanged ? 600 : undefined,
              }}
            >
              {row.fieldLabel}
            </TableCell>

            <TableCell
              sx={{
                color: row.isChanged ? 'error.main' : 'text.secondary',
                wordBreak: 'break-word',
              }}
            >
              {row.previousText}
            </TableCell>

            <TableCell
              sx={{
                color: row.isChanged ? 'secondary.main' : 'text.secondary',
                fontWeight: row.isChanged ? 600 : undefined,
                wordBreak: 'break-word',
              }}
            >
              {row.newText}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
