import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { LoadErrorAlert } from '../../components/feedback/LoadErrorAlert';
import { LoanActionButtons } from '../../components/loans/LoanActionButtons';
import { LoanActionDialogs } from '../../components/loans/LoanActionDialogs';
import { LoanStatusChip } from '../../components/loans/LoanStatusChip';
import { LoanTimeline } from '../../components/loans/LoanTimeline';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { LoanInformationCard } from './LoanInformationCard';
import { useLoanDetailsPage } from './hooks/useLoanDetailsPage';

const { loans: texts } = HebrewTexts;

// One loan: header with status and actions, the details card and the timeline
export function LoanDetailsPage() {
  const detailsPage = useLoanDetailsPage();

  const { loan } = detailsPage;

  if (detailsPage.isLoading) {
    return <LinearProgress />;
  }

  if (detailsPage.loadError || !loan) {
    return (
      <LoadErrorAlert
        error={detailsPage.loadError}
        notFoundMessage={texts.loanNotFound}
        onRetry={detailsPage.retryLoad}
      />
    );
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h1">{loan.book.title}</Typography>

        <LoanStatusChip status={loan.status} />

        <Box
          sx={{
            marginInlineStart: 'auto',
          }}
        >
          <LoanActionButtons
            loan={loan}
            loanActions={detailsPage.loanActions}
            size="medium"
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '3fr 2fr',
          },
          gap: 3,
          alignItems: 'start',
        }}
      >
        <LoanInformationCard
          loan={loan}
          canOpenMember={detailsPage.canOpenMember}
        />

        <Card>
          <CardContent>
            <Typography
              variant="h3"
              sx={{
                mb: 2,
              }}
            >
              {texts.timelineCardTitle}
            </Typography>

            <LoanTimeline events={detailsPage.timelineEvents} />
          </CardContent>
        </Card>
      </Box>

      <LoanActionDialogs loanActions={detailsPage.loanActions} />
    </>
  );
}
