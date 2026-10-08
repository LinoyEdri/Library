import { Link as RouterLink } from 'react-router';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { RecordStatus } from '@library/shared';
import { RecordStatusChip } from '../../components/data-display/RecordStatusChip';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { RoutePaths } from '../../constants/route-paths';
import { formatDateTime } from '../../utils/format-date-time';
import { useMembersListPage } from './hooks/useMembersListPage';

const { members: texts } = HebrewTexts;

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const COLUMN_COUNT = 6;

// Staff: searchable members table; clicking a row opens the member
export function MembersListPage() {
  const listPage = useMembersListPage();

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
          {texts.pageTitle}
        </Typography>

        {listPage.canManageMembers && (
          <Button
            component={RouterLink}
            to={RoutePaths.NEW_MEMBER}
            variant="contained"
            startIcon={<AddIcon />}
          >
            {texts.addMember}
          </Button>
        )}
      </Box>

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

        <TextField
          select
          label={texts.statusColumn}
          value={listPage.statusFilter}
          onChange={(event) => listPage.changeStatusFilter(event.target.value as RecordStatus | '')}
          fullWidth={false}
          sx={{
            minWidth: 160,
          }}
        >
          <MenuItem value="">{HebrewTexts.common.allStatuses}</MenuItem>

          <MenuItem value={RecordStatus.ACTIVE}>
            {HebrewTexts.membershipStatuses[RecordStatus.ACTIVE]}
          </MenuItem>

          <MenuItem value={RecordStatus.DISABLED}>
            {HebrewTexts.membershipStatuses[RecordStatus.DISABLED]}
          </MenuItem>
        </TextField>
      </Box>

      <Card>
        {listPage.isLoading && <LinearProgress />}

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{texts.nameColumn}</TableCell>

                <TableCell>{texts.emailColumn}</TableCell>

                <TableCell>{texts.phoneColumn}</TableCell>

                <TableCell>{texts.cityColumn}</TableCell>

                <TableCell>{texts.registrationDateColumn}</TableCell>

                <TableCell>{texts.statusColumn}</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {listPage.members.map((member) => (
                <TableRow
                  key={member.id}
                  hover
                  onClick={() => listPage.openMember(member.id)}
                  sx={{
                    cursor: 'pointer',
                  }}
                >
                  <TableCell>
                    {member.firstName} {member.lastName}
                  </TableCell>

                  <TableCell>{member.email}</TableCell>

                  <TableCell>{member.phoneNumber}</TableCell>

                  <TableCell>{member.address.city}</TableCell>

                  <TableCell>{formatDateTime(member.registrationDate)}</TableCell>

                  <TableCell>
                    <RecordStatusChip status={member.status} />
                  </TableCell>
                </TableRow>
              ))}

              {!listPage.isLoading && listPage.members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={COLUMN_COUNT}>
                    <Typography
                      color="text.secondary"
                      sx={{
                        py: 3,
                        textAlign: 'center',
                      }}
                    >
                      {texts.noMembers}
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
    </>
  );
}
