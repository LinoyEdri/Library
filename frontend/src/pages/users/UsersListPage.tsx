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
import { RecordStatus, Role } from '@library/shared';
import { RecordStatusChip } from '../../components/data-display/RecordStatusChip';
import { RoleChip } from '../../components/data-display/RoleChip';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { RoutePaths } from '../../constants/route-paths';
import { formatDateTime } from '../../utils/format-date-time';
import { useUsersListPage } from './hooks/useUsersListPage';

const { users: texts } = HebrewTexts;

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const COLUMN_COUNT = 5;

// Admin: every account in the system; clicking a row opens the user
export function UsersListPage() {
  const listPage = useUsersListPage();

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

        <Button
          component={RouterLink}
          to={RoutePaths.NEW_USER}
          variant="contained"
          startIcon={<AddIcon />}
        >
          {texts.addUser}
        </Button>
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
          label={texts.roleFilter}
          value={listPage.roleFilter}
          onChange={(event) => listPage.changeRoleFilter(event.target.value as Role | '')}
          fullWidth={false}
          sx={{
            minWidth: 160,
          }}
        >
          <MenuItem value="">{texts.allRoles}</MenuItem>

          {Object.values(Role).map((role) => (
            <MenuItem
              key={role}
              value={role}
            >
              {HebrewTexts.roles[role]}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label={texts.accountStatusColumn}
          value={listPage.statusFilter}
          onChange={(event) => listPage.changeStatusFilter(event.target.value as RecordStatus | '')}
          fullWidth={false}
          sx={{
            minWidth: 160,
          }}
        >
          <MenuItem value="">{HebrewTexts.common.allStatuses}</MenuItem>

          <MenuItem value={RecordStatus.ACTIVE}>
            {HebrewTexts.recordStatuses[RecordStatus.ACTIVE]}
          </MenuItem>

          <MenuItem value={RecordStatus.DISABLED}>
            {HebrewTexts.recordStatuses[RecordStatus.DISABLED]}
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

                <TableCell>{texts.roleColumn}</TableCell>

                <TableCell>{texts.accountStatusColumn}</TableCell>

                <TableCell>{texts.lastLoginColumn}</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {listPage.users.map((user) => (
                <TableRow
                  key={user.id}
                  hover
                  onClick={() => listPage.openUser(user.id)}
                  sx={{
                    cursor: 'pointer',
                  }}
                >
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>

                  <TableCell>{user.email}</TableCell>

                  <TableCell>
                    <RoleChip role={user.role} />
                  </TableCell>

                  <TableCell>
                    <RecordStatusChip status={user.status} />
                  </TableCell>

                  <TableCell>
                    {user.lastLoginDate
                      ? formatDateTime(user.lastLoginDate)
                      : HebrewTexts.profile.noLastLogin}
                  </TableCell>
                </TableRow>
              ))}

              {!listPage.isLoading && listPage.users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={COLUMN_COUNT}>
                    <Typography
                      color="text.secondary"
                      sx={{
                        py: 3,
                        textAlign: 'center',
                      }}
                    >
                      {texts.noUsers}
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
