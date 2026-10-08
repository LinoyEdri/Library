import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import { HebrewTexts } from '../../constants/hebrew-texts';

type TimeRemainingIndicatorProps = {
  remainingText: string;
  isRunningOut: boolean;
  isExpired: boolean;
};

// "Time left: 4:32" - orange in the last minute, red when the time is up
export function TimeRemainingIndicator({
  remainingText,
  isRunningOut,
  isExpired,
}: TimeRemainingIndicatorProps) {
  const color = isExpired ? 'error.main' : isRunningOut ? 'warning.dark' : 'text.secondary';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.75,
        color,
      }}
    >
      <TimerOutlinedIcon fontSize="small" />

      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
        }}
      >
        {isExpired
          ? HebrewTexts.passwordReset.timeExpired
          : `${HebrewTexts.passwordReset.timeRemaining}: ${remainingText}`}
      </Typography>
    </Box>
  );
}
