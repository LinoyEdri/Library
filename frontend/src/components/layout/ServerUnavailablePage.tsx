import Box from '@mui/material/Box';
import { ServerUnavailableContent } from './ServerUnavailableContent';

type ServerUnavailablePageProps = {
  isRetrying: boolean;
  onRetry: () => void;
};

// Whole screen when the app opens while the server is down (the user is not known yet)
export function ServerUnavailablePage({ isRetrying, onRetry }: ServerUnavailablePageProps) {
  return (
    <Box
      component="main"
      sx={{
        maxWidth: 640,
        mx: 'auto',
        px: 2,
        py: 8,
      }}
    >
      <ServerUnavailableContent
        isRetrying={isRetrying}
        onRetry={onRetry}
      />
    </Box>
  );
}
