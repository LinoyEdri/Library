import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import type { SystemSettingResponse } from '@library/shared';
import { FormTextField } from '../../components/forms/FormTextField';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { useSettingValueForm } from './hooks/useSettingValueForm';

// One setting: title, explanation, value field with its unit, and a save button
export function SettingValueCard({ setting }: { setting: SystemSettingResponse }) {
  const settingForm = useSettingValueForm(setting);

  return (
    <Card>
      <CardContent>
        <Typography
          variant="h4"
          component="h2"
        >
          {settingForm.texts.title}
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mb: 2,
          }}
        >
          {settingForm.texts.description}
        </Typography>

        <Box
          component="form"
          noValidate
          onSubmit={settingForm.submitSettingValue}
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <FormTextField
            control={settingForm.control}
            name="value"
            type="number"
            label={HebrewTexts.settings.valueField}
            helperText={settingForm.defaultValueLabel}
            fullWidth={false}
            sx={{
              width: 200,
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">{settingForm.texts.unit}</InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            loading={settingForm.isSaving}
            disabled={!settingForm.hasUnsavedChanges}
          >
            {HebrewTexts.common.save}
          </Button>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 1,
          }}
        >
          {settingForm.lastUpdatedLabel}
        </Typography>
      </CardContent>
    </Card>
  );
}
