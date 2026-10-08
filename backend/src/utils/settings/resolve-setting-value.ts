import { SYSTEM_SETTING_DEFINITIONS, type SystemSettingKey } from '@library/shared';

// The stored value when it passes the key's rule; otherwise (missing or invalid) the default
export const resolveSettingValue = (key: SystemSettingKey, storedValue: unknown): number => {
  const definition = SYSTEM_SETTING_DEFINITIONS[key];

  const parsedValue = definition.valueSchema.safeParse(storedValue);

  return storedValue !== undefined && storedValue !== null && parsedValue.success
    ? parsedValue.data
    : definition.defaultValue;
};
