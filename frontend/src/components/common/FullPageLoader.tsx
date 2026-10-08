import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

// Centered spinner shown while the logged-in user or a page outside the app layout is loading
export function FullPageLoader() {
  return (
    <Box
      sx={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress aria-label="טוען" />
    </Box>
  );
}
