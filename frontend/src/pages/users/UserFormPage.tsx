import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { LoadErrorAlert } from '../../components/feedback/LoadErrorAlert';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { CreateUserForm } from './CreateUserForm';
import { EditUserForm } from './EditUserForm';
import { useUserFormPage } from './hooks/useUserFormPage';

const { users: texts } = HebrewTexts;

// New user, or edit an existing one (the form opens only after the user has loaded)
export function UserFormPage() {
  const formPage = useUserFormPage();

  if (formPage.isLoadingUser) {
    return <LinearProgress />;
  }

  if (formPage.loadError || (formPage.isEditMode && !formPage.editedUser)) {
    return (
      <LoadErrorAlert
        error={formPage.loadError}
        notFoundMessage={texts.userNotFound}
        onRetry={formPage.retryLoad}
      />
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography
          variant="h1"
          gutterBottom
        >
          {formPage.isEditMode ? texts.editUserTitle : texts.newUserTitle}
        </Typography>

        {formPage.editedUser ? (
          <EditUserForm editedUser={formPage.editedUser} />
        ) : (
          <CreateUserForm />
        )}
      </CardContent>
    </Card>
  );
}
