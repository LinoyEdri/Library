import { Link as RouterLink } from 'react-router';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import type { ManagedUserResponse } from '@library/shared';
import { InformationRow } from '../../components/data-display/InformationRow';
import { RoleChip } from '../../components/data-display/RoleChip';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { buildMemberDetailsPath } from '../../utils/build-member-paths';
import { formatDateTime } from '../../utils/format-date-time';

const { users: texts, addressFields } = HebrewTexts;

// Account facts, personal details and address of one user
export function UserInformationPanel({ user }: { user: ManagedUserResponse }) {
  const { address } = user;

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
            {texts.accountTitle}
          </Typography>

          <InformationRow
            label={texts.emailColumn}
            value={user.email}
          />

          <InformationRow
            label={texts.roleColumn}
            value={<RoleChip role={user.role} />}
          />

          <InformationRow
            label={texts.accountStatusColumn}
            value={HebrewTexts.recordStatuses[user.status]}
          />

          <InformationRow
            label={texts.lastLoginColumn}
            value={
              user.lastLoginDate
                ? formatDateTime(user.lastLoginDate)
                : HebrewTexts.profile.noLastLogin
            }
          />

          <InformationRow
            label={texts.createdDateLabel}
            value={formatDateTime(user.createdDate)}
          />

          {user.disabledDate && (
            <InformationRow
              label={texts.disabledDateLabel}
              value={formatDateTime(user.disabledDate)}
            />
          )}

          <InformationRow
            label={texts.membershipLabel}
            value={
              user.memberId && user.membershipStatus ? (
                <Link
                  component={RouterLink}
                  to={buildMemberDetailsPath(user.memberId)}
                >
                  {HebrewTexts.membershipStatuses[user.membershipStatus]} · {texts.openMembership}
                </Link>
              ) : (
                texts.noMembership
              )
            }
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
            {texts.personalDetailsTitle}
          </Typography>

          <InformationRow
            label={HebrewTexts.fields.phoneNumber}
            value={user.phoneNumber}
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
            value={`${address.street} ${address.houseNumber}, ${addressFields.apartmentOrUnit} ${address.apartmentOrUnit}`}
          />

          <InformationRow
            label={addressFields.postalCode}
            value={address.postalCode ?? '—'}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
