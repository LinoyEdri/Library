import { z } from 'zod';
import { SystemSettingKey } from './system-setting-key.js';

// A whole number between min and max, with Hebrew messages
const wholeNumberBetween = (min: number, max: number) =>
  z.coerce
    .number({ message: 'יש להזין מספר' })
    .int({ message: 'יש להזין מספר שלם' })
    .min(min, { message: `הערך המינימלי הוא ${min}` })
    .max(max, { message: `הערך המקסימלי הוא ${max}` });

// The rule and default value of every setting. A missing or invalid stored value falls back to the default.
export const SYSTEM_SETTING_DEFINITIONS = {
  [SystemSettingKey.LOAN_PERIOD_DAYS]: {
    valueSchema: wholeNumberBetween(1, 90),
    defaultValue: 14,
  },
  [SystemSettingKey.MAX_ACTIVE_LOANS_PER_MEMBER]: {
    valueSchema: wholeNumberBetween(1, 20),
    defaultValue: 5,
  },
} as const satisfies Record<
  SystemSettingKey,
  { valueSchema: z.ZodType<number>; defaultValue: number }
>;

// Route parameter of PATCH /settings/:key
export const systemSettingKeyParamsSchema = z.object({
  key: z.enum(SystemSettingKey, { message: 'הגדרה לא קיימת' }),
});

// Body of PATCH /settings/:key; the value itself is checked by the key's rule
export const updateSystemSettingSchema = z.object({
  value: z.unknown(),
});

export type SystemSettingKeyParams = z.infer<typeof systemSettingKeyParamsSchema>;
export type UpdateSystemSettingInput = z.infer<typeof updateSystemSettingSchema>;
