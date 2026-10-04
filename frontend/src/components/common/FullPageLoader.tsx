import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

// Centered spinner shown while the logged-in user is being loaded
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
