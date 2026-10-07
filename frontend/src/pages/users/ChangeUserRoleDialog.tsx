import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { Role, type ManagedUserResponse } from '@library/shared';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { useChangeUserRoleDialog } from './hooks/useChangeUserRoleDialog';

const { users: texts } = HebrewTexts;

type ChangeUserRoleDialogProps = {
  user: ManagedUserResponse;
  onClose: () => void;
};

// Role picker dialog. Rendered only while open, so it always starts from the current role.
export function ChangeUserRoleDialog({ user, onClose }: ChangeUserRoleDialogProps) {
  const roleDialog = useChangeUserRoleDialog(user, onClose);

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{texts.changeRoleTitle}</DialogTitle>

      <DialogContent>
        <Stack
          spacing={2}
          sx={{
            pt: 1,
          }}
        >
          <TextField
            select
            label={texts.roleField}
            value={roleDialog.selectedRole}
            onChange={(event) => roleDialog.changeSelectedRole(event.target.value as Role)}
          >
            {Object.values(Role).map((role) => (
              <MenuItem
                key={role}
                value={role}
              >
                {HebrewTexts.roles[role]}
              </MenuItem>
            ))}
          </TextField>

          <DialogContentText variant="body2">{texts.changeRoleHint}</DialogContentText>

          {roleDialog.errorMessage && <Alert severity="error">{roleDialog.errorMessage}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{HebrewTexts.common.cancel}</Button>

        <Button
          variant="contained"
          disabled={!roleDialog.canSave}
          loading={roleDialog.isSaving}
          onClick={roleDialog.saveRole}
        >
          {HebrewTexts.common.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
