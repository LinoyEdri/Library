import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { SYSTEM_SETTING_DEFINITIONS, type SystemSettingResponse } from '@library/shared';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { QueryKeys } from '../../../constants/query-keys';
import { useNotification } from '../../../hooks/useNotification';
import { settingsApi } from '../../../services/settings.api';
import { applyServerFieldErrors } from '../../../utils/apply-server-field-errors';
import { formatDateTime } from '../../../utils/format-date-time';
import { getHebrewErrorMessage } from '../../../utils/get-hebrew-error-message';

// The rule accepts any input (text from the field) and turns it into a whole number
type SettingValueFormInput = { value: unknown };
type SettingValueFormOutput = { value: number };

// Edits one setting, validated with the same rule the server uses
export const useSettingValueForm = (setting: SystemSettingResponse) => {
  const queryClient = useQueryClient();

  const { showNotification } = useNotification();

  const settingFormSchema = z.object({
    value: SYSTEM_SETTING_DEFINITIONS[setting.key].valueSchema,
  });

  const { control, handleSubmit, setError, reset, formState } = useForm<
    SettingValueFormInput,
    unknown,
    SettingValueFormOutput
  >({
    resolver: zodResolver(settingFormSchema),
    defaultValues: { value: String(setting.value) },
  });

  const saveMutation = useMutation({
    mutationFn: (value: number) => settingsApi.update(setting.key, value),
  });

  const submitSettingValue = handleSubmit(async ({ value }) => {
    try {
      const savedSetting = await saveMutation.mutateAsync(value);

      await queryClient.invalidateQueries({ queryKey: QueryKeys.SETTINGS });

      reset({ value: String(savedSetting.value) });

      showNotification(HebrewTexts.settings.settingSaved);
    } catch (error) {
      if (!applyServerFieldErrors(error, setError)) {
        showNotification(getHebrewErrorMessage(error), 'error');
      }
    }
  });

  const { definitions } = HebrewTexts.settings;

  return {
    control,
    submitSettingValue,
    isSaving: saveMutation.isPending,
    hasUnsavedChanges: formState.isDirty,
    texts: definitions[setting.key],
    defaultValueLabel: HebrewTexts.settings.defaultValue(setting.defaultValue),
    lastUpdatedLabel: setting.updatedDate
      ? HebrewTexts.settings.lastUpdated(formatDateTime(setting.updatedDate))
      : HebrewTexts.settings.usingDefault,
  };
};
