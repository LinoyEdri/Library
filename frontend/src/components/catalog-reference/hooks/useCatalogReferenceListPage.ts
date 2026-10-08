import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RecordStatus } from '@library/shared';
import { useCan } from '../../../hooks/useCan';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { useNotification } from '../../../hooks/useNotification';
import { getHebrewErrorMessage } from '../../../utils/get-hebrew-error-message';
import type {
  CatalogReferencePageConfig,
  CatalogReferenceRecord,
} from '../catalog-reference-page-config.types';

const DEFAULT_PAGE_SIZE = 20;

// Which dialog is open: create, edit a record, or confirm disabling a record
type OpenDialog<RecordResponse> =
  | { kind: 'none' }
  | { kind: 'create' }
  | { kind: 'edit'; record: RecordResponse }
  | { kind: 'confirmDisable'; record: RecordResponse };

// List state (search, status filter, paging), the data query and the disable/reactivate actions
export const useCatalogReferenceListPage = <RecordResponse extends CatalogReferenceRecord, Details>(
  config: CatalogReferencePageConfig<RecordResponse, Details>,
) => {
  const queryClient = useQueryClient();

  const { showNotification } = useNotification();

  const canManage = useCan(config.managePermission);

  const [searchText, setSearchText] = useState('');

  const [statusFilter, setStatusFilter] = useState<RecordStatus | ''>('');

  const [pageIndex, setPageIndex] = useState(0);

  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [openDialog, setOpenDialog] = useState<OpenDialog<RecordResponse>>({ kind: 'none' });

  const debouncedSearchText = useDebouncedValue(searchText.trim());

  const listParams = {
    page: pageIndex + 1,
    pageSize,
    search: debouncedSearchText || undefined,
    status: statusFilter || undefined,
  };

  const listQuery = useQuery({
    queryKey: [...config.queryKey, listParams],
    queryFn: () => config.api.list(listParams),
    placeholderData: keepPreviousData,
  });

  const refreshList = () => queryClient.invalidateQueries({ queryKey: config.queryKey });

  const handleActionError = (error: unknown) =>
    showNotification(getHebrewErrorMessage(error), 'error');

  const disableMutation = useMutation({
    mutationFn: (record: RecordResponse) => config.api.disable(record.id),
    onSuccess: () => {
      showNotification(config.texts.disabled);
      setOpenDialog({ kind: 'none' });
      return refreshList();
    },
    onError: handleActionError,
  });

  const reactivateMutation = useMutation({
    mutationFn: (record: RecordResponse) => config.api.reactivate(record.id),
    onSuccess: () => {
      showNotification(config.texts.reactivated);
      return refreshList();
    },
    onError: handleActionError,
  });

  // Typing a search or changing the filter starts again from the first page
  const changeSearchText = (newSearchText: string) => {
    setSearchText(newSearchText);
    setPageIndex(0);
  };

  const changeStatusFilter = (newStatusFilter: RecordStatus | '') => {
    setStatusFilter(newStatusFilter);
    setPageIndex(0);
  };

  const changePageSize = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0);
  };

  return {
    canManage,
    records: listQuery.data?.items ?? [],
    totalItems: listQuery.data?.meta.totalItems ?? 0,
    isLoading: listQuery.isFetching,
    searchText,
    changeSearchText,
    statusFilter,
    changeStatusFilter,
    pageIndex,
    setPageIndex,
    pageSize,
    changePageSize,
    openDialog,
    openCreateDialog: () => setOpenDialog({ kind: 'create' }),
    openEditDialog: (record: RecordResponse) => setOpenDialog({ kind: 'edit', record }),
    openDisableConfirmation: (record: RecordResponse) =>
      setOpenDialog({ kind: 'confirmDisable', record }),
    closeDialog: () => setOpenDialog({ kind: 'none' }),
    confirmDisable: (record: RecordResponse) => disableMutation.mutate(record),
    isDisabling: disableMutation.isPending,
    reactivateRecord: (record: RecordResponse) => reactivateMutation.mutate(record),
  };
};
