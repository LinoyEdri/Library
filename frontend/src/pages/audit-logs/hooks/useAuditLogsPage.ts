import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ActionType, AuditLogEntryResponse, EntityType } from '@library/shared';
import type { ReferenceOption } from '../../../components/catalog-reference/reference-option.types';
import { QueryKeys } from '../../../constants/query-keys';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { useTablePaging } from '../../../hooks/useTablePaging';
import { auditLogsApi, type AuditLogListParams } from '../../../services/audit-logs.api';
import { getAuditRecordLabel } from '../../../utils/audit/get-audit-record-label';

// Audit log page: filters, paging and the entry opened in the side drawer
export const useAuditLogsPage = () => {
  const paging = useTablePaging();

  const [actionTypeFilter, setActionTypeFilter] = useState<ActionType | ''>('');
  const [recordTypeFilter, setRecordTypeFilter] = useState<EntityType | ''>('');
  const [userFilter, setUserFilter] = useState<ReferenceOption | null>(null);
  const [entryNumberText, setEntryNumberText] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [openedEntry, setOpenedEntry] = useState<AuditLogEntryResponse | null>(null);

  const debouncedEntryNumber = Number(useDebouncedValue(entryNumberText.trim()));

  // Day strings ("2026-10-07") compare correctly as text
  const isDateRangeInvalid = fromDate !== '' && toDate !== '' && fromDate > toDate;

  const hasActiveFilters = Boolean(
    actionTypeFilter || recordTypeFilter || userFilter || entryNumberText || fromDate || toDate,
  );

  const listParams: AuditLogListParams = {
    page: paging.pageIndex + 1,
    pageSize: paging.pageSize,
    actionType: actionTypeFilter || undefined,
    affectedType: recordTypeFilter || undefined,
    actionUserId: userFilter?.id,
    // Only a whole number from 1 up filters; anything else shows every entry
    entryNumber:
      Number.isInteger(debouncedEntryNumber) && debouncedEntryNumber > 0
        ? debouncedEntryNumber
        : undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  };

  const entriesQuery = useQuery({
    queryKey: [...QueryKeys.AUDIT_LOGS, listParams],
    queryFn: () => auditLogsApi.list(listParams),
    placeholderData: keepPreviousData,
    enabled: !isDateRangeInvalid,
  });

  // Every filter change starts again from the first page
  const withFirstPage =
    <Value>(setValue: (value: Value) => void) =>
    (value: Value) => {
      setValue(value);
      paging.resetToFirstPage();
    };

  const clearFilters = () => {
    setActionTypeFilter('');
    setRecordTypeFilter('');
    setUserFilter(null);
    setEntryNumberText('');
    setFromDate('');
    setToDate('');
    paging.resetToFirstPage();
  };

  return {
    paging,
    // Each entry with its changed record named for the table
    entryRows: (entriesQuery.data?.items ?? []).map((entry) => ({
      entry,
      recordLabel: getAuditRecordLabel(entry),
    })),
    totalItems: entriesQuery.data?.meta.totalItems ?? 0,
    isLoading: entriesQuery.isFetching,
    loadError: entriesQuery.error,
    retryLoad: () => entriesQuery.refetch(),
    actionTypeFilter,
    changeActionTypeFilter: withFirstPage(setActionTypeFilter),
    recordTypeFilter,
    changeRecordTypeFilter: withFirstPage(setRecordTypeFilter),
    userFilter,
    changeUserFilter: withFirstPage(setUserFilter),
    entryNumberText,
    changeEntryNumberText: withFirstPage(setEntryNumberText),
    fromDate,
    changeFromDate: withFirstPage(setFromDate),
    toDate,
    changeToDate: withFirstPage(setToDate),
    isDateRangeInvalid,
    hasActiveFilters,
    clearFilters,
    openedEntry,
    openEntry: setOpenedEntry,
    closeEntry: () => setOpenedEntry(null),
  };
};

export type AuditLogsPageState = ReturnType<typeof useAuditLogsPage>;
