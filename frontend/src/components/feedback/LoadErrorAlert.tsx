import { Navigate } from 'react-router';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
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
// may not see, "not found" for a missing record, otherwise the reason plus a "try again" button
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
