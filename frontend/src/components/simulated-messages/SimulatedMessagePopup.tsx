import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';
import { PasswordResetChannel, type SimulatedPasswordResetMessage } from '@library/shared';
import { SimulatedEmailMessage } from './SimulatedEmailMessage';
import { SimulatedSmsMessage } from './SimulatedSmsMessage';

type SimulatedMessagePopupProps = {
  message: SimulatedPasswordResetMessage;
  onClose: () => void;
};

// A message that "arrived" (no real email/SMS is sent): slides in at the bottom corner and
// stays until closed. Keyed by its code by the caller, so a new code replays the slide-in.
export function SimulatedMessagePopup({ message, onClose }: SimulatedMessagePopupProps) {
  return (
    <Slide
      in
      appear
      direction="up"
    >
      <Box
        role="status"
        sx={{
          position: 'fixed',
          bottom: 24,
          insetInlineEnd: 24,
          width: 'min(360px, calc(100vw - 32px))',
          zIndex: (theme) => theme.zIndex.snackbar,
          borderRadius: 4,
          boxShadow: 12,
        }}
      >
        {message.channel === PasswordResetChannel.SMS ? (
          <SimulatedSmsMessage
            message={message}
            onClose={onClose}
          />
        ) : (
          <SimulatedEmailMessage
            message={message}
            onClose={onClose}
          />
        )}
      </Box>
    </Slide>
  );
}
