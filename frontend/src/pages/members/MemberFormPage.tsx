import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { LoadErrorAlert } from '../../components/feedback/LoadErrorAlert';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { EditMemberForm } from './EditMemberForm';
import { ExistingUserMemberForm } from './ExistingUserMemberForm';
import { NewPersonMemberForm } from './NewPersonMemberForm';
import { useMemberFormPage } from './hooks/useMemberFormPage';

const { members: texts } = HebrewTexts;

// New member (link an existing guest account, or register a new person) or edit a member
export function MemberFormPage() {
  const formPage = useMemberFormPage();

  if (formPage.isLoadingMember) {
    return <LinearProgress />;
  }

  if (formPage.loadError || (formPage.isEditMode && !formPage.editedMember)) {
    return (
      <LoadErrorAlert
        error={formPage.loadError}
        notFoundMessage={texts.memberNotFound}
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
          {formPage.isEditMode ? texts.editMemberTitle : texts.newMemberTitle}
        </Typography>

        {formPage.editedMember && <EditMemberForm editedMember={formPage.editedMember} />}

        {!formPage.isEditMode && (
          <>
            <ToggleButtonGroup
              exclusive
              color="primary"
              value={formPage.createMode}
              onChange={(_event, newMode) => formPage.changeCreateMode(newMode)}
              aria-label={texts.createModeLabel}
              sx={{
                mb: 3,
              }}
            >
              <ToggleButton value="newPerson">{texts.newPersonMode}</ToggleButton>

              <ToggleButton value="existingUser">{texts.linkExistingUserMode}</ToggleButton>
            </ToggleButtonGroup>

            {formPage.createMode === 'newPerson' ? (
              <NewPersonMemberForm />
            ) : (
              <ExistingUserMemberForm />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
