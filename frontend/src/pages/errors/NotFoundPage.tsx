import SearchOffIcon from '@mui/icons-material/SearchOff';
import { ErrorPageLayout } from '../../components/layout/ErrorPageLayout';
import { HebrewTexts } from '../../constants/hebrew-texts';

// 404 - no route matches the URL
export function NotFoundPage() {
  return (
    <ErrorPageLayout
      statusCode={404}
      title={HebrewTexts.errors.notFoundTitle}
      description={HebrewTexts.errors.notFoundDescription}
      icon={<SearchOffIcon sx={{ fontSize: 56, color: 'warning.main' }} />}
    />
  );
}
