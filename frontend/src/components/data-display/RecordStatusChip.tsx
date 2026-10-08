import Chip from '@mui/material/Chip';
import { RecordStatus } from '@library/shared';
import { HebrewTexts } from '../../constants/hebrew-texts';

// Green "פעיל" or grey "מושבת" label
export function RecordStatusChip({ status }: { status: RecordStatus }) {
  return (
    <Chip
      size="small"
      label={HebrewTexts.recordStatuses[status]}
      color={status === RecordStatus.ACTIVE ? 'secondary' : 'default'}
      variant={status === RecordStatus.ACTIVE ? 'filled' : 'outlined'}
    />
  );
}
