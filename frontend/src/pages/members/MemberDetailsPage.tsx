import { Link as RouterLink } from 'react-router';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import BlockIcon from '@mui/icons-material/Block';
import EditIcon from '@mui/icons-material/Edit';
import RestoreIcon from '@mui/icons-material/Restore';
import { RecordStatus } from '@library/shared';
import { RecordStatusChip } from '../../components/data-display/RecordStatusChip';
import { ConfirmActionDialog } from '../../components/feedback/ConfirmActionDialog';
import { LoadErrorAlert } from '../../components/feedback/LoadErrorAlert';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { buildEditMemberPath } from '../../utils/build-member-paths';
import { MemberInformationPanel } from './MemberInformationPanel';
import { useMemberDetailsPage, type MemberDetailsTab } from './hooks/useMemberDetailsPage';

const { members: texts } = HebrewTexts;

// One member: header with actions, then "details" and "loans" tabs
export function MemberDetailsPage() {
  const detailsPage = useMemberDetailsPage();

  const { member } = detailsPage;

  if (detailsPage.isLoading) {
    return <LinearProgress />;
  }

  if (detailsPage.loadError || !member) {
    return (
      <LoadErrorAlert
        error={detailsPage.loadError}
        notFoundMessage={texts.memberNotFound}
        onRetry={detailsPage.retryLoad}
      />
    );
  }

  const isDisabled = member.status === RecordStatus.DISABLED;

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
          {member.firstName} {member.lastName}
        </Typography>

        <RecordStatusChip status={member.status} />

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            marginInlineStart: 'auto',
          }}
        >
          {detailsPage.canManageMembers && (
            <Button
              component={RouterLink}
              to={buildEditMemberPath(member.id)}
              variant="contained"
              startIcon={<EditIcon />}
            >
              {HebrewTexts.common.edit}
            </Button>
          )}

          {detailsPage.canManageMembers && !isDisabled && (
            <Button
              color="error"
              variant="outlined"
              startIcon={<BlockIcon />}
              onClick={detailsPage.openDisableConfirmation}
            >
              {HebrewTexts.common.disable}
            </Button>
          )}

          {detailsPage.canManageMembers && isDisabled && (
            <Button
              color="secondary"
              variant="outlined"
              startIcon={<RestoreIcon />}
              loading={detailsPage.isReactivating}
              onClick={detailsPage.reactivateMember}
            >
              {HebrewTexts.common.reactivate}
            </Button>
          )}
        </Box>
      </Box>

      {isDisabled && (
        <Alert
          severity="warning"
          sx={{
            mb: 2,
          }}
        >
          {texts.disabledMemberNote}
        </Alert>
      )}

      <Tabs
        value={detailsPage.selectedTab}
        onChange={(_event, newTab: MemberDetailsTab) => detailsPage.selectTab(newTab)}
        sx={{
          mb: 3,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Tab
          value="details"
          label={texts.detailsTab}
        />

        <Tab
          value="loans"
          label={texts.loansTab}
        />
      </Tabs>

      {detailsPage.selectedTab === 'details' && <MemberInformationPanel member={member} />}

      {detailsPage.selectedTab === 'loans' && (
        <Card>
          <CardContent>
            <Typography color="text.secondary">{texts.loansComingSoon}</Typography>
          </CardContent>
        </Card>
      )}

      <ConfirmActionDialog
        isOpen={detailsPage.isDisableConfirmationOpen}
        title={HebrewTexts.common.disableConfirmationTitle}
        message={HebrewTexts.common.disableConfirmationText.replace(
          '{name}',
          `${member.firstName} ${member.lastName}`,
        )}
        isConfirming={detailsPage.isDisabling}
        onConfirm={detailsPage.confirmDisable}
        onCancel={detailsPage.closeDisableConfirmation}
      />
    </>
  );
}
