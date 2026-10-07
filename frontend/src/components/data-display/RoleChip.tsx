import Chip, { type ChipProps } from '@mui/material/Chip';
import { Role } from '@library/shared';
import { HebrewTexts } from '../../constants/hebrew-texts';

// Chip color for each role
const chipColorByRole: Record<Role, ChipProps['color']> = {
  [Role.ADMIN]: 'primary',
  [Role.LIBRARIAN]: 'secondary',
  [Role.MEMBER]: 'warning',
  [Role.VIEWER]: 'default',
};

// The role in Hebrew, e.g. "מנהל מערכת"
export function RoleChip({ role }: { role: Role }) {
  return (
    <Chip
      size="small"
      variant="outlined"
      label={HebrewTexts.roles[role]}
      color={chipColorByRole[role]}
    />
  );
}
