import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { ActionType, EntityType } from '@library/shared';
import { SingleReferenceAutocomplete } from '../../components/catalog-reference/SingleReferenceAutocomplete';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { BELOW_FIELD_SELECT_MENU_PROPS } from '../../constants/select-menu-props';
import { auditLogUserOptionSource } from './audit-log-user-option-source';
import type { AuditLogsPageState } from './hooks/useAuditLogsPage';

const { auditLogs: texts } = HebrewTexts;

// Action, record type, user, record id and date range filters of the audit log
export function AuditLogFilters({ page }: { page: AuditLogsPageState }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 2,
        mb: 2,
      }}
    >
      <TextField
        select
        label={texts.actionFilter}
        value={page.actionTypeFilter}
        onChange={(event) => page.changeActionTypeFilter(event.target.value as ActionType | '')}
        slotProps={{
          select: {
            MenuProps: BELOW_FIELD_SELECT_MENU_PROPS,
          },
        }}
      >
        <MenuItem value="">{texts.allActions}</MenuItem>

        {Object.values(ActionType).map((actionType) => (
          <MenuItem
            key={actionType}
            value={actionType}
          >
            {HebrewTexts.actionTypes[actionType]}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label={texts.recordTypeFilter}
        value={page.recordTypeFilter}
        onChange={(event) => page.changeRecordTypeFilter(event.target.value as EntityType | '')}
        slotProps={{
          select: {
            MenuProps: BELOW_FIELD_SELECT_MENU_PROPS,
          },
        }}
      >
        <MenuItem value="">{texts.allRecordTypes}</MenuItem>

        {Object.values(EntityType).map((entityType) => (
          <MenuItem
            key={entityType}
            value={entityType}
          >
            {HebrewTexts.entityTypes[entityType]}
          </MenuItem>
        ))}
      </TextField>

      <SingleReferenceAutocomplete
        source={auditLogUserOptionSource}
        label={texts.userFilter}
        value={page.userFilter}
        onChange={page.changeUserFilter}
      />

      <TextField
        type="number"
        label={texts.entryNumberFilter}
        value={page.entryNumberText}
        onChange={(event) => page.changeEntryNumberText(event.target.value)}
        slotProps={{
          htmlInput: {
            min: 1,
          },
        }}
      />

      <TextField
        type="date"
        label={texts.fromDateFilter}
        value={page.fromDate}
        onChange={(event) => page.changeFromDate(event.target.value)}
        slotProps={{
          inputLabel: {
            shrink: true,
          },
        }}
      />

      <TextField
        type="date"
        label={texts.toDateFilter}
        value={page.toDate}
        onChange={(event) => page.changeToDate(event.target.value)}
        error={page.isDateRangeInvalid}
        helperText={page.isDateRangeInvalid ? texts.invalidDateRange : undefined}
        slotProps={{
          inputLabel: {
            shrink: true,
          },
        }}
      />

      {page.hasActiveFilters && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Button
            startIcon={<FilterAltOffIcon />}
            onClick={page.clearFilters}
          >
            {texts.clearFilters}
          </Button>
        </Box>
      )}
    </Box>
  );
}
