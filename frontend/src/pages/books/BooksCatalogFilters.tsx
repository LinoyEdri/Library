import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import { RecordStatus } from '@library/shared';
import { SingleReferenceAutocomplete } from '../../components/catalog-reference/SingleReferenceAutocomplete';
import {
  authorOptionSource,
  categoryOptionSource,
  publisherOptionSource,
} from '../../components/catalog-reference/reference-option-sources';
import { HebrewTexts } from '../../constants/hebrew-texts';
import type {
  AvailabilityFilter,
  BookSortOption,
  BooksCatalogState,
} from './hooks/useBooksCatalog';

const { books: texts } = HebrewTexts;

// Responsive grid: one filter per row on phones, up to four per row on wide screens
const filtersGridStyle = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: {
    xs: '1fr',
    sm: '1fr 1fr',
    lg: 'repeat(4, 1fr)',
  },
  mb: 3,
};

// Search, filters and sort above the books grid
export function BooksCatalogFilters({ catalog }: { catalog: BooksCatalogState }) {
  return (
    <Box sx={filtersGridStyle}>
      <TextField
        value={catalog.searchText}
        onChange={(event) => catalog.changeSearchText(event.target.value)}
        placeholder={texts.searchPlaceholder}
        sx={{
          gridColumn: {
            sm: 'span 2',
          },
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

      <SingleReferenceAutocomplete
        source={authorOptionSource}
        label={texts.authorFilter}
        value={catalog.authorFilter}
        onChange={catalog.changeAuthorFilter}
      />

      <SingleReferenceAutocomplete
        source={categoryOptionSource}
        label={texts.categoryFilter}
        value={catalog.categoryFilter}
        onChange={catalog.changeCategoryFilter}
      />

      <SingleReferenceAutocomplete
        source={publisherOptionSource}
        label={texts.publisherFilter}
        value={catalog.publisherFilter}
        onChange={catalog.changePublisherFilter}
      />

      <TextField
        select
        label={texts.languageFilter}
        value={catalog.languageFilter}
        onChange={(event) => catalog.changeLanguageFilter(event.target.value)}
      >
        <MenuItem value="">{texts.allOption}</MenuItem>

        {catalog.languages.map((language) => (
          <MenuItem
            key={language}
            value={language}
          >
            {language}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label={texts.availabilityFilter}
        value={catalog.availabilityFilter}
        onChange={(event) =>
          catalog.changeAvailabilityFilter(event.target.value as AvailabilityFilter)
        }
      >
        <MenuItem value="">{texts.allOption}</MenuItem>

        <MenuItem value="available">{texts.availableOption}</MenuItem>

        <MenuItem value="unavailable">{texts.unavailableOption}</MenuItem>
      </TextField>

      <TextField
        select
        label={texts.sortLabel}
        value={catalog.sortOption}
        onChange={(event) => catalog.changeSortOption(event.target.value as BookSortOption)}
      >
        <MenuItem value="title">{texts.sortByTitle}</MenuItem>

        <MenuItem value="newest">{texts.sortByNewest}</MenuItem>

        <MenuItem value="recentlyAdded">{texts.sortByRecentlyAdded}</MenuItem>
      </TextField>

      {catalog.canSeeDisabledBooks && (
        <TextField
          select
          label={HebrewTexts.common.statusFilter}
          value={catalog.statusFilter}
          onChange={(event) => catalog.changeStatusFilter(event.target.value as RecordStatus | '')}
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

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Button onClick={catalog.clearFilters}>{texts.clearFilters}</Button>
      </Box>
    </Box>
  );
}
