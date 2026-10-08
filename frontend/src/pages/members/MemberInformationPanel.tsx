import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import type { MemberResponse } from '@library/shared';
import { InformationRow } from '../../components/data-display/InformationRow';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { formatStreetAddress } from '../../utils/format-street-address';
import { formatDateTime } from '../../utils/format-date-time';

const { members: texts, addressFields } = HebrewTexts;

// Personal details, address and membership facts of one member
export function MemberInformationPanel({ member }: { member: MemberResponse }) {
  const { address } = member;

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: {
          md: 'repeat(3, 1fr)',
        },
      }}
    >
      <Card>
        <CardContent>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
          >
            {texts.personalDetailsTitle}
          </Typography>

          <InformationRow
            label={texts.emailColumn}
            value={member.email}
          />

          <InformationRow
            label={texts.phoneColumn}
            value={member.phoneNumber}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
          >
            {texts.addressTitle}
          </Typography>

          <InformationRow
            label={addressFields.city}
            value={address.city}
          />

          <InformationRow
            label={addressFields.street}
            value={formatStreetAddress(address)}
          />

          <InformationRow
            label={addressFields.postalCode}
            value={address.postalCode ?? '—'}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
          >
            {texts.membershipTitle}
          </Typography>

          <InformationRow
            label={texts.memberStatusLabel}
            value={HebrewTexts.membershipStatuses[member.status]}
          />

          <InformationRow
            label={texts.registrationDateLabel}
            value={formatDateTime(member.registrationDate)}
          />

          {member.disabledDate && (
            <InformationRow
              label={texts.disabledDateLabel}
              value={formatDateTime(member.disabledDate)}
            />
          )}

          <InformationRow
            label={texts.accountStatusLabel}
            value={HebrewTexts.recordStatuses[member.accountStatus]}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
