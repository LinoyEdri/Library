import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import type { SimulatedPasswordResetMessage } from '@library/shared';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { SimulatedMessageColors as colors } from './simulated-message-colors';

const { simulated: texts } = HebrewTexts.passwordReset;

type SimulatedEmailMessageProps = {
  message: SimulatedPasswordResetMessage;
  onClose: () => void;
};

// Looks like an email opened in an inbox preview
export function SimulatedEmailMessage({ message, onClose }: SimulatedEmailMessageProps) {
  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: 3,
        borderTop: 4,
        borderColor: colors.emailAccent,
        p: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: colors.emailAccent,
        }}
      >
        <EmailOutlinedIcon fontSize="small" />

        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            flexGrow: 1,
          }}
        >
          {texts.inboxLabel} · {texts.now}
        </Typography>

        <IconButton
          size="small"
          aria-label={texts.close}
          onClick={onClose}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Typography variant="body2">
        <b>{texts.fromLabel}:</b> {texts.senderName} &lt;{texts.senderEmail}&gt;
      </Typography>

      <Typography variant="body2">
        <b>{texts.toLabel}:</b> {message.recipient}
      </Typography>

      <Typography variant="body2">
        <b>{texts.subjectLabel}:</b> {texts.emailSubject}
      </Typography>

      <Divider
        sx={{
          my: 1.5,
        }}
      />

      <Typography variant="body2">{texts.emailGreeting}</Typography>

      <Typography variant="body2">{texts.emailBody(message.validMinutes)}</Typography>

      <Typography
        sx={{
          my: 1.5,
          py: 1,
          borderRadius: 2,
          backgroundColor: colors.emailCodeBackground,
          fontFamily: 'monospace',
          fontSize: '1.75rem',
          fontWeight: 700,
          letterSpacing: '0.4em',
          textAlign: 'center',
          direction: 'ltr',
        }}
      >
        {message.code}
      </Typography>

      <Typography
        variant="caption"
        component="p"
        color="text.secondary"
      >
        {texts.emailFooter}
      </Typography>

      <Typography
        variant="caption"
        component="p"
        sx={{
          mt: 1,
          color: colors.emailAccent,
        }}
      >
        {texts.simulationNote}
      </Typography>
    </Box>
  );
}
