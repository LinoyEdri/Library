import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { FormTextField } from '../forms/FormTextField';
import { HebrewTexts } from '../../constants/hebrew-texts';
import type {
  CatalogReferencePageConfig,
  CatalogReferenceRecord,
} from './catalog-reference-page-config.types';
import { useCatalogReferenceFormDialog } from './hooks/useCatalogReferenceFormDialog';

type CatalogReferenceFormDialogProps<RecordResponse extends CatalogReferenceRecord, Details> = {
  config: CatalogReferencePageConfig<RecordResponse, Details>;
  editedRecord?: RecordResponse;
  onClose: () => void;
};

// Create or edit dialog. Rendered only while open, so every opening starts with fresh values.
export function CatalogReferenceFormDialog<RecordResponse extends CatalogReferenceRecord, Details>({
  config,
  editedRecord,
  onClose,
}: CatalogReferenceFormDialogProps<RecordResponse, Details>) {
  const { control, submitForm, isSaving, dialogTitle } = useCatalogReferenceFormDialog({
    config,
    editedRecord,
    onClose,
  });

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
        <DialogTitle>{dialogTitle}</DialogTitle>

        <DialogContent>
          <Stack
            spacing={2}
            sx={{
              pt: 1,
            }}
          >
            {config.formFields.map((formField, index) => (
              <FormTextField
                key={formField.name}
                control={control}
                name={formField.name}
                label={formField.label}
                multiline={formField.multiline}
                minRows={formField.multiline ? 3 : undefined}
                autoFocus={index === 0}
              />
            ))}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>{HebrewTexts.common.cancel}</Button>

          <Button
            type="submit"
            variant="contained"
            loading={isSaving}
          >
            {HebrewTexts.common.save}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
