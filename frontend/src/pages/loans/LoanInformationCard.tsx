import { Link as RouterLink } from 'react-router';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import type { LoanResponse } from '@library/shared';
import { CopyStatusChip } from '../../components/books/CopyStatusChip';
import { InformationRow } from '../../components/data-display/InformationRow';
import { LoanDueDate } from '../../components/loans/LoanDueDate';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { buildBookDetailsPath } from '../../utils/build-book-paths';
import { buildMemberDetailsPath } from '../../utils/build-member-paths';
import { formatDateTime } from '../../utils/format-date-time';

const { loans: texts } = HebrewTexts;

type LoanInformationCardProps = {
  loan: LoanResponse;
  // Staff get a link to the member's page
  canOpenMember: boolean;
};

// Who borrowed what and when, and who handled it
export function LoanInformationCard({ loan, canOpenMember }: LoanInformationCardProps) {
  const memberName = `${loan.member.firstName} ${loan.member.lastName}`;

  return (
    <Card>
      <CardContent>
        <Typography
          variant="h3"
          sx={{
            mb: 2,
          }}
        >
          {texts.detailsCardTitle}
        </Typography>

        <InformationRow
          label={texts.bookColumn}
          value={
            <Link
              component={RouterLink}
              to={buildBookDetailsPath(loan.book.id)}
            >
              {loan.book.title}
            </Link>
          }
        />

        <InformationRow
          label={texts.memberColumn}
          value={
            canOpenMember ? (
              <Link
                component={RouterLink}
                to={buildMemberDetailsPath(loan.member.id)}
              >
                {memberName}
              </Link>
            ) : (
              memberName
            )
          }
        />

        <InformationRow
          label={texts.barcodeColumn}
          value={loan.copy.barcode}
        />

        <InformationRow
          label={texts.copyStatus}
          value={<CopyStatusChip status={loan.copy.status} />}
        />

        <InformationRow
          label={texts.loanDateColumn}
          value={formatDateTime(loan.createdDate)}
        />

        <InformationRow
          label={texts.dueDateColumn}
          value={<LoanDueDate loan={loan} />}
        />

        <InformationRow
          label={texts.createdBy}
          value={`${loan.createdBy.firstName} ${loan.createdBy.lastName}`}
        />

        {loan.returnProcessedBy && (
          <InformationRow
            label={texts.returnProcessedBy}
            value={`${loan.returnProcessedBy.firstName} ${loan.returnProcessedBy.lastName}`}
          />
        )}
      </CardContent>
    </Card>
  );
}
