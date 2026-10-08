import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { AccountInformationCard } from './AccountInformationCard';
import { ChangePasswordCard } from './ChangePasswordCard';
import { PersonalDetailsCard } from './PersonalDetailsCard';

// Profile: editable details on the wide column, account information and password on the side
export function ProfilePage() {
  return (
    <>
      <Typography
        variant="h1"
        gutterBottom
      >
        {HebrewTexts.profile.pageTitle}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          alignItems: 'start',
          gridTemplateColumns: {
            lg: '2fr 1fr',
          },
        }}
      >
        <PersonalDetailsCard />

        <Stack spacing={3}>
          <AccountInformationCard />

          <ChangePasswordCard />
        </Stack>
      </Box>
    </>
  );
}
