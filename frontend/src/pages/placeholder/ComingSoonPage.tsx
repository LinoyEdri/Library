import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { HebrewTexts } from '../../constants/hebrew-texts';

// Temporary page for menu items whose slice is not built yet
export function ComingSoonPage({ title }: { title: string }) {
  return (
    <>
      <Typography variant="h1" gutterBottom>
        {title}
      </Typography>

      <Card>
        <CardContent>
          <Typography color="text.secondary">{HebrewTexts.placeholders.comingSoon}</Typography>
        </CardContent>
      </Card>
    </>
  );
}
