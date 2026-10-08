import Typography from '@mui/material/Typography';
import { ServerUnavailableAlert } from '../feedback/ServerUnavailableAlert';
import { useCurrentPageTitle } from './hooks/useCurrentPageTitle';

type ServerUnavailableContentProps = {
  isRetrying: boolean;
  onRetry: () => void;
};

// Replaces a page that could not load: only its title, the message and "try again"
export function ServerUnavailableContent({ isRetrying, onRetry }: ServerUnavailableContentProps) {
  const pageTitle = useCurrentPageTitle();

  return (
    <>
      {pageTitle && (
        <Typography
          variant="h1"
          sx={{
            mb: 3,
          }}
        >
          {pageTitle}
        </Typography>
      )}

      <ServerUnavailableAlert
        isRetrying={isRetrying}
        onRetry={onRetry}
      />
    </>
  );
}
