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
import { HebrewTexts } from '../../constants/hebrew-texts';
import { RecordStatusChip } from '../data-display/RecordStatusChip';
import { ConfirmActionDialog } from '../feedback/ConfirmActionDialog';
import { CatalogReferenceFormDialog } from './CatalogReferenceFormDialog';
import { CatalogReferenceListToolbar } from './CatalogReferenceListToolbar';
import { CatalogReferenceRowActions } from './CatalogReferenceRowActions';
import type {
  CatalogReferencePageConfig,
  CatalogReferenceRecord,
} from './catalog-reference-page-config.types';
import { useCatalogReferenceListPage } from './hooks/useCatalogReferenceListPage';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

// Searchable, paginated table of authors, publishers or categories.
// Managers (admins) also get the status column, filter, add/edit and disable/reactivate.
export function CatalogReferenceListPage<RecordResponse extends CatalogReferenceRecord, Details>({
  config,
}: {
  config: CatalogReferencePageConfig<RecordResponse, Details>;
}) {
  const listPage = useCatalogReferenceListPage(config);

  const { openDialog } = listPage;

  const columnCount = config.columns.length + (listPage.canManage ? 2 : 0);

  return (
    <>
      <CatalogReferenceListToolbar
        searchText={listPage.searchText}
        onSearchTextChange={listPage.changeSearchText}
        statusFilter={listPage.statusFilter}
        onStatusFilterChange={listPage.changeStatusFilter}
        canManage={listPage.canManage}
        addButtonLabel={config.texts.addButton}
        onAddClick={listPage.openCreateDialog}
      />

      <Card>
        {listPage.isLoading && <LinearProgress />}

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {config.columns.map((column) => (
                  <TableCell key={column.header}>{column.header}</TableCell>
                ))}

                {listPage.canManage && <TableCell>{HebrewTexts.common.statusColumn}</TableCell>}

                {listPage.canManage && <TableCell>{HebrewTexts.common.actionsColumn}</TableCell>}
              </TableRow>
            </TableHead>

            <TableBody>
              {listPage.records.map((record) => (
                <TableRow
                  key={record.id}
                  hover
                >
                  {config.columns.map((column) => (
                    <TableCell key={column.header}>{column.renderCell(record)}</TableCell>
                  ))}

                  {listPage.canManage && (
                    <TableCell>
                      <RecordStatusChip status={record.status} />
                    </TableCell>
                  )}

                  {listPage.canManage && (
                    <TableCell>
                      <CatalogReferenceRowActions
                        status={record.status}
                        onEdit={() => listPage.openEditDialog(record)}
                        onDisable={() => listPage.openDisableConfirmation(record)}
                        onReactivate={() => listPage.reactivateRecord(record)}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}

              {!listPage.isLoading && listPage.records.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columnCount}>
                    <Typography
                      color="text.secondary"
                      sx={{
                        py: 3,
                        textAlign: 'center',
                      }}
                    >
                      {config.texts.emptyList}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={listPage.totalItems}
          page={listPage.pageIndex}
          onPageChange={(_event, newPageIndex) => listPage.setPageIndex(newPageIndex)}
          rowsPerPage={listPage.pageSize}
          onRowsPerPageChange={(event) => listPage.changePageSize(Number(event.target.value))}
          rowsPerPageOptions={PAGE_SIZE_OPTIONS}
          labelRowsPerPage={HebrewTexts.common.rowsPerPage}
          labelDisplayedRows={({ from, to, count }) =>
            HebrewTexts.common.displayedRows(from, to, count)
          }
        />
      </Card>

      {(openDialog.kind === 'create' || openDialog.kind === 'edit') && (
        <CatalogReferenceFormDialog
          config={config}
          editedRecord={openDialog.kind === 'edit' ? openDialog.record : undefined}
          onClose={listPage.closeDialog}
        />
      )}

      <ConfirmActionDialog
        isOpen={openDialog.kind === 'confirmDisable'}
        title={HebrewTexts.common.disableConfirmationTitle}
        message={
          openDialog.kind === 'confirmDisable'
            ? HebrewTexts.common.disableConfirmationText.replace(
                '{name}',
                config.getRecordName(openDialog.record),
              )
            : ''
        }
        isConfirming={listPage.isDisabling}
        onConfirm={() =>
          openDialog.kind === 'confirmDisable' && listPage.confirmDisable(openDialog.record)
        }
        onCancel={listPage.closeDialog}
      />
    </>
  );
}
