import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import RefreshIcon from '@mui/icons-material/Refresh';
import { HebrewTexts } from '../../constants/hebrew-texts';

type ServerUnavailableAlertProps = {
  isRetrying: boolean;
  onRetry: () => void;
};

// "No connection to the server" with a "try again" button under the message
export function ServerUnavailableAlert({ isRetrying, onRetry }: ServerUnavailableAlertProps) {
  return (
    <Alert severity="warning">
      <Typography>{HebrewTexts.errors.networkError}</Typography>

      <Button
        variant="contained"
        color="warning"
        startIcon={<RefreshIcon />}
        loading={isRetrying}
        onClick={onRetry}
        sx={{
          mt: 1.5,
        }}
      >
        {HebrewTexts.common.retry}
      </Button>
    </Alert>
  );
}
