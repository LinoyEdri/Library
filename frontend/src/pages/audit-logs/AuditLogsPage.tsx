import Typography from '@mui/material/Typography';
import { LoadErrorAlert } from '../../components/feedback/LoadErrorAlert';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { AuditLogEntryDrawer } from './AuditLogEntryDrawer';
import { AuditLogFilters } from './AuditLogFilters';
import { AuditLogsTable } from './AuditLogsTable';
import { useAuditLogsPage } from './hooks/useAuditLogsPage';

const { auditLogs: texts } = HebrewTexts;

// Admin: filterable, read-only history of every change; a row opens its details drawer
export function AuditLogsPage() {
  const page = useAuditLogsPage();

  return (
    <>
      <Typography variant="h1">{texts.pageTitle}</Typography>

      <Typography
        color="text.secondary"
        sx={{
          mb: 3,
        }}
      >
        {texts.pageSubtitle}
      </Typography>

      <AuditLogFilters page={page} />

      {page.loadError ? (
        <LoadErrorAlert
          error={page.loadError}
          notFoundMessage={texts.noEntries}
          onRetry={page.retryLoad}
        />
      ) : (
        <AuditLogsTable page={page} />
      )}

      {page.openedEntry && (
        <AuditLogEntryDrawer
          entry={page.openedEntry}
          onClose={page.closeEntry}
        />
      )}
    </>
  );
}
