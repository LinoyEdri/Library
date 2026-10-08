import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { HebrewTexts } from '../../constants/hebrew-texts';

type ConfirmActionDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  isConfirming: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// "Are you sure?" dialog for actions like disabling a record
export function ConfirmActionDialog({
  isOpen,
  title,
  message,
  isConfirming,
  onConfirm,
  onCancel,
}: ConfirmActionDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel}>{HebrewTexts.common.cancel}</Button>

        <Button
          variant="contained"
          color="error"
          loading={isConfirming}
          onClick={onConfirm}
        >
          {HebrewTexts.common.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
