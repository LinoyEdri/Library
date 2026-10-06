import { Link as RouterLink } from 'react-router';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { RoutePaths } from '../../constants/route-paths';
import { BookCard } from './BookCard';
import { BooksCatalogFilters } from './BooksCatalogFilters';
import { useBooksCatalog } from './hooks/useBooksCatalog';

// Catalog: filters on top, a responsive grid of book cards, and pages at the bottom
export function BooksCatalogPage() {
  const catalog = useBooksCatalog();

  return (
    <>
      {catalog.canCreateBooks && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mb: 2,
          }}
        >
          <Button
            component={RouterLink}
            to={RoutePaths.NEW_BOOK}
            variant="contained"
            startIcon={<AddIcon />}
          >
            {HebrewTexts.books.addBook}
          </Button>
        </Box>
      )}

      <BooksCatalogFilters catalog={catalog} />

      {catalog.isLoading && (
        <LinearProgress
          sx={{
            mb: 2,
          }}
        />
      )}

      {!catalog.isLoading && catalog.books.length === 0 && (
        <Typography
          color="text.secondary"
          sx={{
            textAlign: 'center',
            py: 6,
          }}
        >
          {HebrewTexts.books.noBooks}
        </Typography>
      )}

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            xl: 'repeat(4, 1fr)',
          },
        }}
      >
        {catalog.books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
          />
        ))}
      </Box>

      {catalog.totalPages > 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 4,
          }}
        >
          <Pagination
            count={catalog.totalPages}
            page={catalog.page}
            onChange={(_event, newPage) => catalog.setPage(newPage)}
            color="primary"
          />
        </Box>
      )}
    </>
  );
}
