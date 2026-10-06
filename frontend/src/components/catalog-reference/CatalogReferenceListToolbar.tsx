import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { RecordStatus } from '@library/shared';
import { HebrewTexts } from '../../constants/hebrew-texts';

type CatalogReferenceListToolbarProps = {
  searchText: string;
  onSearchTextChange: (searchText: string) => void;
  statusFilter: RecordStatus | '';
  onStatusFilterChange: (statusFilter: RecordStatus | '') => void;
  // Managers see the status filter and the add button
  canManage: boolean;
  addButtonLabel: string;
  onAddClick: () => void;
};

// Search box, status filter (managers) and add button (managers) above a list
export function CatalogReferenceListToolbar({
  searchText,
  onSearchTextChange,
  statusFilter,
  onStatusFilterChange,
  canManage,
  addButtonLabel,
  onAddClick,
}: CatalogReferenceListToolbarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
        mb: 2,
      }}
    >
      <TextField
        value={searchText}
        onChange={(event) => onSearchTextChange(event.target.value)}
        placeholder={HebrewTexts.common.search}
        fullWidth={false}
        sx={{
          flexGrow: 1,
          minWidth: 220,
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

      {canManage && (
        <TextField
          select
          label={HebrewTexts.common.statusFilter}
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as RecordStatus | '')}
          fullWidth={false}
          sx={{
            minWidth: 140,
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
      )}

      {canManage && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddClick}
        >
          {addButtonLabel}
        </Button>
      )}
    </Box>
  );
}
