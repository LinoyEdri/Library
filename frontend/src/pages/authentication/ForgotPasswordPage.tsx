import { Link as RouterLink } from 'react-router';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { AuthenticationPageLayout } from '../../components/layout/AuthenticationPageLayout';
import { SimulatedMessagePopup } from '../../components/simulated-messages/SimulatedMessagePopup';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { RoutePaths } from '../../constants/route-paths';
import { PasswordResetCodeForm } from './PasswordResetCodeForm';
import { PasswordResetRequestForm } from './PasswordResetRequestForm';
import { useForgotPasswordPage } from './hooks/useForgotPasswordPage';

const { passwordReset: texts } = HebrewTexts;

// Guests reset a forgotten password: choose email/SMS, get a code, type it, then set the password
export function ForgotPasswordPage() {
  const forgotPasswordPage = useForgotPasswordPage();

  const { codeSent, receivedMessage } = forgotPasswordPage;

  return (
    <AuthenticationPageLayout
      title={codeSent ? texts.codeTitle : texts.requestTitle}
      subtitle={codeSent ? '' : texts.requestSubtitle}
    >
      {codeSent ? (
        <PasswordResetCodeForm
          key={codeSent.requestId}
          codeSent={codeSent}
          onCodeVerified={forgotPasswordPage.openResetPage}
          onResendCode={forgotPasswordPage.resendCode}
          isResending={forgotPasswordPage.isResending}
          onChangeMethod={forgotPasswordPage.changeMethod}
        />
      ) : (
        <PasswordResetRequestForm onCodeSent={forgotPasswordPage.showCodeSent} />
      )}

      <Typography
        variant="body2"
        sx={{
          mt: 2,
          textAlign: 'center',
        }}
      >
        <Link
          component={RouterLink}
          to={RoutePaths.LOGIN}
        >
          {texts.backToLogin}
        </Link>
      </Typography>

      {receivedMessage && (
        <SimulatedMessagePopup
          key={receivedMessage.code}
          message={receivedMessage}
          onClose={forgotPasswordPage.closeReceivedMessage}
        />
      )}
    </AuthenticationPageLayout>
  );
}
