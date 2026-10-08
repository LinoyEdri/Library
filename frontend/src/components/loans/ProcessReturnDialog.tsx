import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { returnCopyConditions, type LoanResponse, type ReturnCopyCondition } from '@library/shared';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { useProcessReturnDialog } from './hooks/useProcessReturnDialog';

const { loans: texts } = HebrewTexts;

type ProcessReturnDialogProps = {
  loan: LoanResponse;
  isSaving: boolean;
  onConfirm: (copyCondition: ReturnCopyCondition) => void;
  onClose: () => void;
};

// Staff confirm a physical return and choose the copy's condition.
// Rendered only while open, so every opening starts from "intact".
export function ProcessReturnDialog({
  loan,
  isSaving,
  onConfirm,
  onClose,
}: ProcessReturnDialogProps) {
  const { copyCondition, changeCopyCondition } = useProcessReturnDialog();

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        {texts.processReturn} · {loan.book.title}
      </DialogTitle>

      <DialogContent>
        <DialogContentText>
          {texts.processReturnText.replace('{barcode}', loan.copy.barcode)}
        </DialogContentText>

        <RadioGroup
          aria-label={texts.copyConditionField}
          value={copyCondition}
          onChange={(event) => changeCopyCondition(event.target.value as ReturnCopyCondition)}
          sx={{
            mt: 1,
          }}
        >
          {returnCopyConditions.map((condition) => (
            <FormControlLabel
              key={condition}
              value={condition}
              control={<Radio />}
              label={texts.copyConditions[condition]}
            />
          ))}
        </RadioGroup>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{HebrewTexts.common.cancel}</Button>

        <Button
          variant="contained"
          loading={isSaving}
          onClick={() => onConfirm(copyCondition)}
        >
          {texts.processReturn}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
