import { Link as RouterLink } from 'react-router';
import { Controller } from 'react-hook-form';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { BookDetailsResponse } from '@library/shared';
import { MultipleReferenceAutocomplete } from '../../components/catalog-reference/MultipleReferenceAutocomplete';
import { SingleReferenceAutocomplete } from '../../components/catalog-reference/SingleReferenceAutocomplete';
import {
  authorOptionSource,
  categoryOptionSource,
  publisherOptionSource,
} from '../../components/catalog-reference/reference-option-sources';
import { FormTextField } from '../../components/forms/FormTextField';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { useBookForm } from './hooks/useBookForm';

const { books: texts } = HebrewTexts;

const twoColumnRowStyle = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: {
    sm: '1fr 1fr',
  },
};

// Create/edit book form. `editedBook` is undefined when creating.
export function BookForm({ editedBook }: { editedBook?: BookDetailsResponse }) {
  const bookForm = useBookForm(editedBook);

  const { control } = bookForm;

  return (
    <Card>
      <CardContent>
        <Stack
          component="form"
          spacing={2}
          noValidate
          onSubmit={bookForm.submitBook}
        >
          <Typography variant="h1">{bookForm.pageTitle}</Typography>

          <FormTextField
            control={control}
            name="title"
            label={texts.titleField}
            autoFocus
          />

          <Controller
            control={control}
            name="authors"
            render={({ field, fieldState }) => (
              <MultipleReferenceAutocomplete
                source={authorOptionSource}
                label={texts.authorsField}
                value={field.value}
                onChange={field.onChange}
                helperText={texts.authorsHelp}
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <Box sx={twoColumnRowStyle}>
            <Controller
              control={control}
              name="publisher"
              render={({ field, fieldState }) => (
                <SingleReferenceAutocomplete
                  source={publisherOptionSource}
                  label={texts.publisherField}
                  value={field.value}
                  onChange={field.onChange}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="categories"
              render={({ field }) => (
                <MultipleReferenceAutocomplete
                  source={categoryOptionSource}
                  label={texts.categoriesField}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                sm: '2fr 1fr 1fr',
              },
            }}
          >
            <FormTextField
              control={control}
              name="isbn"
              label={texts.isbnField}
              helperText={texts.isbnHelp}
            />

            <FormTextField
              control={control}
              name="publicationYear"
              label={texts.publicationYearField}
              inputMode="numeric"
            />

            <FormTextField
              control={control}
              name="language"
              label={texts.languageField}
            />
          </Box>

          <FormTextField
            control={control}
            name="imageUrl"
            label={texts.imageUrlField}
            type="url"
          />

          <FormTextField
            control={control}
            name="description"
            label={texts.descriptionField}
            multiline
            minRows={4}
          />

          <Box
            sx={{
              display: 'flex',
              gap: 1,
            }}
          >
            <Button
              type="submit"
              variant="contained"
              loading={bookForm.isSaving}
            >
              {HebrewTexts.common.save}
            </Button>

            <Button
              component={RouterLink}
              to={bookForm.cancelPath}
              relative="path"
            >
              {HebrewTexts.common.cancel}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
