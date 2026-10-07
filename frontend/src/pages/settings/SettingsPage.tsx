import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { LoadErrorAlert } from '../../components/feedback/LoadErrorAlert';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { SettingValueCard } from './SettingValueCard';
import { useSettingsPage } from './hooks/useSettingsPage';

const { settings: texts } = HebrewTexts;

// Admin: library-wide settings, one card per setting
export function SettingsPage() {
  const settingsPage = useSettingsPage();

  return (
    <>
      <Typography variant="h1">{texts.pageTitle}</Typography>

      <Typography
        color="text.secondary"
        sx={{
          mb: 3,
        }}
      >
        {texts.pageDescription}
      </Typography>

      {settingsPage.isLoading && <LinearProgress />}

      {settingsPage.loadError && (
        <LoadErrorAlert
          error={settingsPage.loadError}
          notFoundMessage={HebrewTexts.errors.recordNotFound}
          onRetry={settingsPage.retryLoad}
        />
      )}

      <Stack
        spacing={3}
        sx={{
          maxWidth: 720,
        }}
      >
        {settingsPage.settings.map((setting) => (
          <SettingValueCard
            key={setting.key}
            setting={setting}
          />
        ))}
      </Stack>
    </>
  );
}
