import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import CloseIcon from '@mui/icons-material/Close';
import type { SimulatedPasswordResetMessage } from '@library/shared';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { SimulatedMessageColors as colors } from './simulated-message-colors';

const { simulated: texts } = HebrewTexts.passwordReset;

type SimulatedSmsMessageProps = {
  message: SimulatedPasswordResetMessage;
  onClose: () => void;
};

// Looks like a text message notification on a phone
export function SimulatedSmsMessage({ message, onClose }: SimulatedSmsMessageProps) {
  return (
    <Box
      sx={{
        backgroundColor: colors.smsBackground,
        color: colors.smsText,
        borderRadius: 4,
        p: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 1,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            placeItems: 'center',
            width: 28,
            height: 28,
            borderRadius: 1.5,
            backgroundColor: colors.smsAppIcon,
          }}
        >
          <ChatBubbleIcon
            sx={{
              fontSize: 16,
              color: colors.smsText,
            }}
          />
        </Box>

        <Typography
          sx={{
            fontWeight: 700,
            flexGrow: 1,
          }}
        >
          {texts.senderName}{' '}
          <Typography
            component="span"
            variant="body2"
            sx={{
              color: colors.smsSecondaryText,
            }}
          >
            · {texts.now}
          </Typography>
        </Typography>

        <IconButton
          size="small"
          aria-label={texts.close}
          onClick={onClose}
          sx={{
            color: colors.smsSecondaryText,
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Typography
        sx={{
          lineHeight: 1.6,
        }}
      >
        {texts.smsBody(message.code, message.validMinutes)}
      </Typography>

      <Typography
        variant="caption"
        component="p"
        sx={{
          mt: 1.5,
          color: colors.smsSecondaryText,
        }}
      >
        {texts.smsRecipient(message.recipient)} · {texts.simulationNote}
      </Typography>
    </Box>
  );
}
