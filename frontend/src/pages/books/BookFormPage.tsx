import LinearProgress from '@mui/material/LinearProgress';
import { LoadErrorAlert } from '../../components/feedback/LoadErrorAlert';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { BookForm } from './BookForm';
import { useBookFormPage } from './hooks/useBookFormPage';

// New book, or edit an existing one (the form opens only after the book has loaded)
export function BookFormPage() {
  const { isEditMode, editedBook, isLoadingBook, loadError, retryLoad } = useBookFormPage();

  if (isLoadingBook) {
    return <LinearProgress />;
  }

  if (loadError || (isEditMode && !editedBook)) {
    return (
      <LoadErrorAlert
        error={loadError}
        notFoundMessage={HebrewTexts.books.bookNotFound}
        onRetry={retryLoad}
      />
    );
  }

  return <BookForm editedBook={editedBook} />;
}
