import { Controller } from 'react-hook-form';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { SingleReferenceAutocomplete } from '../../components/catalog-reference/SingleReferenceAutocomplete';
import { FormTextField } from '../../components/forms/FormTextField';
import {
  activeBookOptionSource,
  activeMemberOptionSource,
} from '../../components/loans/loan-option-sources';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { useNewLoanDialog } from './hooks/useNewLoanDialog';

const { loans: texts } = HebrewTexts;

// Staff lend a book. Rendered only while open, so every opening starts empty.
export function NewLoanDialog({ onClose }: { onClose: () => void }) {
  const { control, submitForm, isSaving, submitErrorMessage } = useNewLoanDialog(onClose);

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <form
        noValidate
        onSubmit={submitForm}
      >
        <DialogTitle>{texts.newLoan}</DialogTitle>

        <DialogContent>
          <Stack
            spacing={2}
            sx={{
              pt: 1,
            }}
          >
            {submitErrorMessage && <Alert severity="error">{submitErrorMessage}</Alert>}

            <Controller
              control={control}
              name="member"
              render={({ field, fieldState }) => (
                <SingleReferenceAutocomplete
                  source={activeMemberOptionSource}
                  label={texts.memberField}
                  value={field.value}
                  onChange={field.onChange}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="book"
              render={({ field, fieldState }) => (
                <SingleReferenceAutocomplete
                  source={activeBookOptionSource}
                  label={texts.bookField}
                  value={field.value}
                  onChange={field.onChange}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <FormTextField
              control={control}
              name="barcode"
              label={texts.barcodeField}
              helperText={texts.barcodeHelp}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>{HebrewTexts.common.cancel}</Button>

          <Button
            type="submit"
            variant="contained"
            loading={isSaving}
          >
            {texts.lend}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
