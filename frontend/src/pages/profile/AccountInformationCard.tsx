import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { useAccountInformation } from './hooks/useAccountInformation';

// One "label: value" row
function AccountInformationRow({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 2,
        py: 1,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Typography color="text.secondary">{label}</Typography>

      <Typography
        sx={{
          fontWeight: 500,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

// Read-only account facts: email, role, membership status (members only) and last login
export function AccountInformationCard() {
  const accountInformation = useAccountInformation();

  if (!accountInformation) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
        >
          {HebrewTexts.profile.accountInformationTitle}
        </Typography>

        <AccountInformationRow
          label={HebrewTexts.fields.email}
          value={accountInformation.email}
        />

        <AccountInformationRow
          label={HebrewTexts.profile.role}
          value={accountInformation.roleLabel}
        />

        {accountInformation.membershipStatusLabel && (
          <AccountInformationRow
            label={HebrewTexts.profile.membershipStatus}
            value={accountInformation.membershipStatusLabel}
          />
        )}

        <AccountInformationRow
          label={HebrewTexts.profile.lastLogin}
          value={accountInformation.lastLoginLabel}
        />
      </CardContent>
    </Card>
  );
}
