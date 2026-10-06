import { Link as RouterLink } from 'react-router';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { HebrewTexts } from '../../constants/hebrew-texts';

type MemberFormActionsProps = {
  isSaving: boolean;
  cancelPath: string;
};

// Save and cancel buttons at the bottom of the member forms
export function MemberFormActions({ isSaving, cancelPath }: MemberFormActionsProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
      }}
    >
      <Button
        type="submit"
        variant="contained"
        loading={isSaving}
      >
        {HebrewTexts.common.save}
      </Button>

      <Button
        component={RouterLink}
        to={cancelPath}
      >
        {HebrewTexts.common.cancel}
      </Button>
    </Box>
  );
}
