import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { LoanStatus } from '@library/shared';
import { SingleReferenceAutocomplete } from '../../components/catalog-reference/SingleReferenceAutocomplete';
import { LoanActionDialogs } from '../../components/loans/LoanActionDialogs';
import { LoansTable } from '../../components/loans/LoansTable';
import {
  anyBookOptionSource,
  anyMemberOptionSource,
} from '../../components/loans/loan-option-sources';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { NewLoanDialog } from './NewLoanDialog';
import { useLoansListPage, type LoansListTab } from './hooks/useLoansListPage';

const { loans: texts } = HebrewTexts;

// Staff: all loans with tabs and filters, plus "new loan". Members: their own loans.
export function LoansListPage() {
  const listPage = useLoansListPage();

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          mb: 2,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            flexGrow: 1,
          }}
        >
          {listPage.canViewAllLoans ? texts.pageTitle : texts.ownLoansTitle}
        </Typography>

        {listPage.canCreateLoans && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={listPage.openNewLoanDialog}
          >
            {texts.newLoan}
          </Button>
        )}
      </Box>

      {listPage.canViewAllLoans && (
        <Tabs
          value={listPage.selectedTab}
          onChange={(_event, newTab: LoansListTab) => listPage.selectTab(newTab)}
          sx={{
            mb: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tab
            value="all"
            label={texts.allTab}
          />

          <Tab
            value="pendingReturns"
            label={texts.pendingReturnsTab}
          />

          <Tab
            value="overdue"
            label={texts.overdueTab}
          />
        </Tabs>
      )}

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2,
        }}
      >
        <TextField
          value={listPage.searchText}
          onChange={(event) => listPage.changeSearchText(event.target.value)}
          placeholder={texts.searchPlaceholder}
          fullWidth={false}
          sx={{
            flexGrow: 1,
            minWidth: 240,
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />

        {listPage.showStatusFilter && (
          <TextField
            select
            label={texts.statusColumn}
            value={listPage.statusFilter}
            onChange={(event) => listPage.changeStatusFilter(event.target.value as LoanStatus | '')}
            fullWidth={false}
            sx={{
              minWidth: 160,
            }}
          >
            <MenuItem value="">{HebrewTexts.common.allStatuses}</MenuItem>

            {Object.values(LoanStatus).map((loanStatus) => (
              <MenuItem
                key={loanStatus}
                value={loanStatus}
              >
                {HebrewTexts.loanStatuses[loanStatus]}
              </MenuItem>
            ))}
          </TextField>
        )}

        {listPage.canViewAllLoans && (
          <Box
            sx={{
              minWidth: 240,
            }}
          >
            <SingleReferenceAutocomplete
              source={anyMemberOptionSource}
              label={texts.memberFilter}
              value={listPage.memberFilter}
              onChange={listPage.changeMemberFilter}
            />
          </Box>
        )}

        {listPage.canViewAllLoans && (
          <Box
            sx={{
              minWidth: 240,
            }}
          >
            <SingleReferenceAutocomplete
              source={anyBookOptionSource}
              label={texts.bookFilter}
              value={listPage.bookFilter}
              onChange={listPage.changeBookFilter}
            />
          </Box>
        )}
      </Box>

      <LoansTable
        loans={listPage.loans}
        totalItems={listPage.totalItems}
        isLoading={listPage.isLoading}
        pageIndex={listPage.paging.pageIndex}
        pageSize={listPage.paging.pageSize}
        onPageIndexChange={listPage.paging.setPageIndex}
        onPageSizeChange={listPage.paging.changePageSize}
        showMemberColumn={listPage.canViewAllLoans}
        loanActions={listPage.loanActions}
        onOpenLoan={listPage.openLoan}
      />

      <LoanActionDialogs loanActions={listPage.loanActions} />

      {listPage.isNewLoanDialogOpen && <NewLoanDialog onClose={listPage.closeNewLoanDialog} />}
    </>
  );
}
