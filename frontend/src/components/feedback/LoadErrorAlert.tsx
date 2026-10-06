import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { getLoadErrorMessage, isRetryableLoadError } from '../../utils/get-load-error-message';

type LoadErrorAlertProps = {
  error: unknown;
  notFoundMessage: string;
  onRetry: () => void;
};

// Shown when a page could not load its data: "not found" for a missing record,
// otherwise the reason plus a "try again" button
export function LoadErrorAlert({ error, notFoundMessage, onRetry }: LoadErrorAlertProps) {
  return (
    <Alert
      severity="warning"
      action={
        isRetryableLoadError(error) && (
          <Button
            color="inherit"
            size="small"
            onClick={onRetry}
          >
            {HebrewTexts.common.retry}
          </Button>
        )
      }
    >
      {getLoadErrorMessage(error, notFoundMessage)}
    </Alert>
  );
}
