import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import type { AuditLogEntryResponse } from '@library/shared';
import { InformationRow } from '../../components/data-display/InformationRow';
import { RoleChip } from '../../components/data-display/RoleChip';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { formatDateTime } from '../../utils/format-date-time';
import { AuditValueComparisonTable } from './AuditValueComparisonTable';
import { useAuditLogEntryDrawer } from './hooks/useAuditLogEntryDrawer';

const { auditLogs: texts } = HebrewTexts;

type AuditLogEntryDrawerProps = {
  entry: AuditLogEntryResponse;
  onClose: () => void;
};

// Side panel: who did what and when, the values before and after, and any extra context
export function AuditLogEntryDrawer({ entry, onClose }: AuditLogEntryDrawerProps) {
  const { recordLabel, comparisonRows, contextRows } = useAuditLogEntryDrawer(entry);

  return (
    <Drawer
      open
      anchor="right"
      onClose={onClose}
      sx={{
        // Above the app bar, which otherwise covers the panel's title and close button
        zIndex: (theme) => theme.zIndex.drawer + 2,
      }}
      slotProps={{
        paper: {
          sx: {
            width: {
              xs: '100%',
              sm: 520,
            },
            p: 3,
          },
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography
          variant="h2"
          sx={{
            flexGrow: 1,
          }}
        >
          {HebrewTexts.actionTypes[entry.actionType]}
        </Typography>

        <Tooltip title={texts.close}>
          <IconButton
            aria-label={texts.close}
            onClick={onClose}
            sx={{
              backgroundColor: 'action.hover',
            }}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <InformationRow
        label={texts.entryNumberLabel}
        value={entry.entryNumber}
      />

      <InformationRow
        label={texts.timeColumn}
        value={formatDateTime(entry.createdDate)}
      />

      <InformationRow
        label={texts.userColumn}
        value={
          <>
            {entry.actionUser.firstName} {entry.actionUser.lastName}{' '}
            <RoleChip role={entry.actionUserRole} />
          </>
        }
      />

      <InformationRow
        label={texts.recordTypeColumn}
        value={HebrewTexts.entityTypes[entry.affectedType]}
      />

      <InformationRow
        label={texts.recordColumn}
        value={recordLabel}
      />

      <Divider
        sx={{
          my: 2,
        }}
      />

      <Typography
        variant="h3"
        sx={{
          mb: 1,
        }}
      >
        {texts.changesTitle}
      </Typography>

      {comparisonRows.length > 0 ? (
        <AuditValueComparisonTable rows={comparisonRows} />
      ) : (
        <Typography color="text.secondary">{texts.noStoredValues}</Typography>
      )}

      {contextRows.length > 0 && (
        <>
          <Divider
            sx={{
              my: 2,
            }}
          />

          <Typography
            variant="h3"
            sx={{
              mb: 1,
            }}
          >
            {texts.contextTitle}
          </Typography>

          {contextRows.map((row) => (
            <InformationRow
              key={row.fieldPath}
              label={row.fieldLabel}
              value={row.valueText}
            />
          ))}
        </>
      )}
    </Drawer>
  );
}
