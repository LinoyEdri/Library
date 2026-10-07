import { Link as RouterLink } from 'react-router';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import BadgeIcon from '@mui/icons-material/Badge';
import BlockIcon from '@mui/icons-material/Block';
import EditIcon from '@mui/icons-material/Edit';
import RestoreIcon from '@mui/icons-material/Restore';
import { RecordStatus } from '@library/shared';
import { RecordStatusChip } from '../../components/data-display/RecordStatusChip';
import { ConfirmActionDialog } from '../../components/feedback/ConfirmActionDialog';
import { LoadErrorAlert } from '../../components/feedback/LoadErrorAlert';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { buildEditUserPath } from '../../utils/build-user-paths';
import { ChangeUserRoleDialog } from './ChangeUserRoleDialog';
import { UserInformationPanel } from './UserInformationPanel';
import { useUserDetailsPage } from './hooks/useUserDetailsPage';

const { users: texts } = HebrewTexts;

// One user: header with edit / change role / disable-reactivate, then the account details
export function UserDetailsPage() {
  const detailsPage = useUserDetailsPage();

  const { user } = detailsPage;

  if (detailsPage.isLoading) {
    return <LinearProgress />;
  }

  if (detailsPage.loadError || !user) {
    return (
      <LoadErrorAlert
        error={detailsPage.loadError}
        notFoundMessage={texts.userNotFound}
        onRetry={detailsPage.retryLoad}
      />
    );
  }

  const isDisabled = user.status === RecordStatus.DISABLED;

  const canChangeRoleAndStatus = !detailsPage.isOwnAccount;

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          mb: 2,
        }}
      >
        <Typography variant="h1">
          {user.firstName} {user.lastName}
        </Typography>

        <RecordStatusChip status={user.status} />

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            marginInlineStart: 'auto',
          }}
        >
          <Button
            component={RouterLink}
            to={buildEditUserPath(user.id)}
            variant="contained"
            startIcon={<EditIcon />}
          >
            {HebrewTexts.common.edit}
          </Button>

          {canChangeRoleAndStatus && (
            <Button
              variant="outlined"
              startIcon={<BadgeIcon />}
              onClick={detailsPage.openRoleDialog}
            >
              {texts.changeRole}
            </Button>
          )}

          {canChangeRoleAndStatus && !isDisabled && (
            <Button
              color="error"
              variant="outlined"
              startIcon={<BlockIcon />}
              onClick={detailsPage.openDisableConfirmation}
            >
              {HebrewTexts.common.disable}
            </Button>
          )}

          {canChangeRoleAndStatus && isDisabled && (
            <Button
              color="secondary"
              variant="outlined"
              startIcon={<RestoreIcon />}
              loading={detailsPage.isReactivating}
              onClick={detailsPage.reactivateUser}
            >
              {HebrewTexts.common.reactivate}
            </Button>
          )}
        </Box>
      </Box>

      {detailsPage.isOwnAccount && (
        <Alert
          severity="info"
          sx={{
            mb: 2,
          }}
        >
          {texts.ownAccountNote}
        </Alert>
      )}

      {isDisabled && (
        <Alert
          severity="warning"
          sx={{
            mb: 2,
          }}
        >
          {texts.disabledAccountNote}
        </Alert>
      )}

      <UserInformationPanel user={user} />

      {detailsPage.isRoleDialogOpen && (
        <ChangeUserRoleDialog
          user={user}
          onClose={detailsPage.closeRoleDialog}
        />
      )}

      <ConfirmActionDialog
        isOpen={detailsPage.isDisableConfirmationOpen}
        title={HebrewTexts.common.disableConfirmationTitle}
        message={HebrewTexts.common.disableConfirmationText.replace(
          '{name}',
          `${user.firstName} ${user.lastName}`,
        )}
        isConfirming={detailsPage.isDisabling}
        onConfirm={detailsPage.confirmDisable}
        onCancel={detailsPage.closeDisableConfirmation}
      />
    </>
  );
}
