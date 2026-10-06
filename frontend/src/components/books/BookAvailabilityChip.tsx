import Chip from '@mui/material/Chip';
import { HebrewTexts } from '../../constants/hebrew-texts';

type BookAvailabilityChipProps = {
  availableCopies: number;
  totalCopies: number;
};

// Green "available (2/3)" when a copy is on the shelf, otherwise grey "not available"
export function BookAvailabilityChip({ availableCopies, totalCopies }: BookAvailabilityChipProps) {
  const isAvailable = availableCopies > 0;

  return (
    <Chip
      size="small"
      color={isAvailable ? 'secondary' : 'default'}
      variant={isAvailable ? 'filled' : 'outlined'}
      label={
        isAvailable
          ? HebrewTexts.books.availableCopies(availableCopies, totalCopies)
          : HebrewTexts.books.notAvailable
      }
    />
  );
}
