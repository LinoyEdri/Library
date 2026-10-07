import { Navigate } from 'react-router';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import RefreshIcon from '@mui/icons-material/Refresh';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { RoutePaths } from '../../constants/route-paths';
import { getLoadErrorMessage, isRetryableLoadError } from '../../utils/get-load-error-message';
import { isForbiddenError } from '../../utils/is-forbidden-error';

type LoadErrorAlertProps = {
  error: unknown;
  notFoundMessage: string;
  onRetry: () => void;
};

// Shown when a page could not load its data: the unauthorized page for a record the user
// may not see, "not found" for a missing record, otherwise the reason with a "try again" button under it
export function LoadErrorAlert({ error, notFoundMessage, onRetry }: LoadErrorAlertProps) {
  if (isForbiddenError(error)) {
    return (
      <Navigate
        to={RoutePaths.UNAUTHORIZED}
        replace
      />
    );
  }

  return (
    <Alert severity="warning">
      <Typography>{getLoadErrorMessage(error, notFoundMessage)}</Typography>

      {isRetryableLoadError(error) && (
        <Button
          variant="contained"
          color="warning"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          sx={{
            mt: 1.5,
          }}
        >
          {HebrewTexts.common.retry}
        </Button>
      )}
    </Alert>
  );
}
