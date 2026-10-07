import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import { formatDateTime } from '../../utils/format-date-time';
import type { LoanTimelineEvent } from './loan-timeline-event.types';

// Vertical list of what happened to the loan; a future due date is shown as not reached yet
export function LoanTimeline({ events }: { events: LoanTimelineEvent[] }) {
  return (
    <Stepper
      orientation="vertical"
      nonLinear
    >
      {events.map((event) => (
        <Step
          key={`${event.label}-${event.date}`}
          completed={!event.isUpcoming && !event.isMissed}
          active={false}
        >
          <StepLabel
            error={event.isMissed}
            optional={
              <Typography
                variant="caption"
                color={event.isMissed ? 'error' : 'text.secondary'}
              >
                {formatDateTime(event.date)}
              </Typography>
            }
          >
            {event.label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
