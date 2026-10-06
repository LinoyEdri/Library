import { Link as RouterLink } from 'react-router';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BlockIcon from '@mui/icons-material/Block';
import EditIcon from '@mui/icons-material/Edit';
import RestoreIcon from '@mui/icons-material/Restore';
import { RecordStatus } from '@library/shared';
import { BookAvailabilityChip } from '../../components/books/BookAvailabilityChip';
import { BookCoverImage } from '../../components/books/BookCoverImage';
import { ConfirmActionDialog } from '../../components/feedback/ConfirmActionDialog';
import { LoadErrorAlert } from '../../components/feedback/LoadErrorAlert';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { buildEditBookPath } from '../../utils/build-book-paths';
import { BookCopiesSection } from './BookCopiesSection';
import { InformationRow } from '../../components/data-display/InformationRow';
import { useBookDetailsPage } from './hooks/useBookDetailsPage';

const { books: texts } = HebrewTexts;

const COVER_HEIGHT = 380;

// Full book information; staff also get edit, disable/reactivate and the copies table
export function BookDetailsPage() {
  const detailsPage = useBookDetailsPage();

  const { book } = detailsPage;

  if (detailsPage.isLoading) {
    return <LinearProgress />;
  }

  if (detailsPage.loadError || !book) {
    return (
      <LoadErrorAlert
        error={detailsPage.loadError}
        notFoundMessage={texts.bookNotFound}
        onRetry={detailsPage.retryLoad}
      />
    );
  }

  const isDisabled = book.status === RecordStatus.DISABLED;

  return (
    <Stack spacing={3}>
      <Card>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '280px 1fr',
            },
          }}
        >
          <BookCoverImage
            imageUrl={book.imageUrl}
            title={book.title}
            height={COVER_HEIGHT}
          />

          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Typography variant="h1">{book.title}</Typography>

              {isDisabled && (
                <Chip
                  color="error"
                  variant="outlined"
                  label={texts.disabledBook}
                />
              )}
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              {book.authors.map((author) => (
                <Chip
                  key={author.id}
                  label={`${author.firstName} ${author.lastName}`}
                  variant={author.isPrimaryAuthor ? 'filled' : 'outlined'}
                  color="primary"
                  title={author.isPrimaryAuthor ? texts.primaryAuthor : undefined}
                />
              ))}
            </Box>

            <Box>
              <BookAvailabilityChip
                availableCopies={book.availableCopies}
                totalCopies={book.totalCopies}
              />
            </Box>

            <InformationRow
              label={texts.publisherLabel}
              value={book.publisher.name}
            />

            <InformationRow
              label={texts.publicationYearLabel}
              value={book.publicationYear ?? '—'}
            />

            <InformationRow
              label={texts.languageLabel}
              value={book.language}
            />

            <InformationRow
              label={texts.isbnLabel}
              value={book.isbn ?? '—'}
            />

            <InformationRow
              label={texts.categoriesLabel}
              value={book.categories.map((category) => category.name).join(', ') || '—'}
            />

            <Typography
              color={book.description ? 'text.primary' : 'text.secondary'}
              sx={{
                mt: 1,
                whiteSpace: 'pre-line',
              }}
            >
              {book.description ?? texts.noDescription}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                mt: 'auto',
                pt: 2,
              }}
            >
              {detailsPage.canEditBook && (
                <Button
                  component={RouterLink}
                  to={buildEditBookPath(book.id)}
                  variant="contained"
                  startIcon={<EditIcon />}
                >
                  {HebrewTexts.common.edit}
                </Button>
              )}

              {detailsPage.canDisableBook && !isDisabled && (
                <Button
                  color="error"
                  variant="outlined"
                  startIcon={<BlockIcon />}
                  onClick={detailsPage.openDisableConfirmation}
                >
                  {HebrewTexts.common.disable}
                </Button>
              )}

              {detailsPage.canDisableBook && isDisabled && (
                <Button
                  color="secondary"
                  variant="outlined"
                  startIcon={<RestoreIcon />}
                  loading={detailsPage.isReactivating}
                  onClick={detailsPage.reactivateBook}
                >
                  {HebrewTexts.common.reactivate}
                </Button>
              )}
            </Box>
          </CardContent>
        </Box>
      </Card>

      {detailsPage.canManageCopies && book.copies && (
        <BookCopiesSection
          bookId={book.id}
          copies={book.copies}
        />
      )}

      <ConfirmActionDialog
        isOpen={detailsPage.isDisableConfirmationOpen}
        title={HebrewTexts.common.disableConfirmationTitle}
        message={HebrewTexts.common.disableConfirmationText.replace('{name}', book.title)}
        isConfirming={detailsPage.isDisabling}
        onConfirm={detailsPage.confirmDisable}
        onCancel={detailsPage.closeDisableConfirmation}
      />
    </Stack>
  );
}
