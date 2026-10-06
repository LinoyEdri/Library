import { HebrewTexts } from '../../../constants/hebrew-texts';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { formatDateTime } from '../../../utils/format-date-time';

// Read-only account details of the current user, ready for display
export const useAccountInformation = () => {
  const { currentUser } = useAuthentication();

  if (!currentUser) {
    return null;
  }

  return {
    email: currentUser.email,
    roleLabel: HebrewTexts.roles[currentUser.role],
    // Only members have a membership; for everyone else the row is hidden
    membershipStatusLabel: currentUser.membershipStatus
      ? HebrewTexts.membershipStatuses[currentUser.membershipStatus]
      : null,
    lastLoginLabel: currentUser.lastLoginDate
      ? formatDateTime(currentUser.lastLoginDate)
      : HebrewTexts.profile.noLastLogin,
  };
};
