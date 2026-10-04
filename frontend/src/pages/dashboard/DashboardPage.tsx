import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { useAuthentication } from '../../hooks/useAuthentication';

// Placeholder - role-based statistics arrive in the dashboard slice
export function DashboardPage() {
  const { currentUser } = useAuthentication();

  return (
    <>
      <Typography
        variant="h1"
        gutterBottom
      >
        {HebrewTexts.placeholders.dashboardWelcome} {currentUser?.firstName}
      </Typography>

      <Card>
        <CardContent>
          <Typography color="text.secondary">{HebrewTexts.placeholders.comingSoon}</Typography>
        </CardContent>
      </Card>
    </>
  );
}
