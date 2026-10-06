import { Link as RouterLink } from 'react-router';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { RecordStatus, type BookSummaryResponse } from '@library/shared';
import { BookAvailabilityChip } from '../../components/books/BookAvailabilityChip';
import { BookCoverImage } from '../../components/books/BookCoverImage';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { buildBookDetailsPath } from '../../utils/build-book-paths';
import { formatAuthorNames } from '../../utils/format-author-names';

const COVER_HEIGHT = 220;

// One book in the catalog grid; the whole card opens the book's details
export function BookCard({ book }: { book: BookSummaryResponse }) {
  return (
    <Card
      sx={{
        height: '100%',
        opacity: book.status === RecordStatus.DISABLED ? 0.6 : 1,
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={buildBookDetailsPath(book.id)}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <BookCoverImage
          imageUrl={book.imageUrl}
          title={book.title}
          height={COVER_HEIGHT}
        />

        <CardContent
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          <Typography
            variant="h6"
            component="h2"
          >
            {book.title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {formatAuthorNames(book.authors)}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {book.publisher.name}
            {book.publicationYear ? ` · ${book.publicationYear}` : ''}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              mt: 'auto',
              pt: 1,
            }}
          >
            <BookAvailabilityChip
              availableCopies={book.availableCopies}
              totalCopies={book.totalCopies}
            />

            {book.status === RecordStatus.DISABLED && (
              <Chip
                size="small"
                variant="outlined"
                color="error"
                label={HebrewTexts.books.disabledBook}
              />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
