import Chip, { type ChipProps } from '@mui/material/Chip';
import { CopyStatus } from '@library/shared';
import { HebrewTexts } from '../../constants/hebrew-texts';

// Chip color for each copy status
const chipColorByCopyStatus: Record<CopyStatus, ChipProps['color']> = {
  [CopyStatus.AVAILABLE]: 'secondary',
  [CopyStatus.ON_LOAN]: 'primary',
  [CopyStatus.DAMAGED]: 'warning',
  [CopyStatus.LOST]: 'error',
  [CopyStatus.DISABLED]: 'default',
};

export function CopyStatusChip({ status }: { status: CopyStatus }) {
  return (
    <Chip
      size="small"
      label={HebrewTexts.copyStatuses[status]}
      color={chipColorByCopyStatus[status]}
    />
  );
}
