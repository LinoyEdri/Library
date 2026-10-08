import { StatusCodes } from 'http-status-codes';
import LockIcon from '@mui/icons-material/Lock';
import { ErrorPageLayout } from '../../components/layout/ErrorPageLayout';
import { HebrewTexts } from '../../constants/hebrew-texts';

// 403 - the user is logged in but their role may not open the page
export function UnauthorizedPage() {
  return (
    <ErrorPageLayout
      statusCode={StatusCodes.FORBIDDEN}
      title={HebrewTexts.errors.unauthorizedTitle}
      description={HebrewTexts.errors.unauthorizedDescription}
      icon={
        <LockIcon
          sx={{
            fontSize: 56,
            color: 'warning.main',
          }}
        />
      }
    />
  );
}
