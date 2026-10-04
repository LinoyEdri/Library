import { z } from 'zod';

// Default Zod messages (e.g. "expected string") are shown in Hebrew, in both backend and frontend
z.config(z.locales.he());

type StringFieldOptions = {
  min: number;
  max: number;
  fieldName: string;
  regex?: RegExp;
  regexMessage?: string;
};

// Reusable patterns. \p{L} matches letters in any language (Hebrew and English).
export const regexTypes = {
  lettersOnly: /^[\p{L}\s'"׳״.-]+$/u,
  digitsOnly: /^\d+$/,
} as const;

// Trimmed string with length limits and an optional pattern. Messages are in Hebrew.
export const createStringField = ({
  min,
  max,
  fieldName,
  regex,
  regexMessage,
}: StringFieldOptions) => {
  const baseSchema = z
    .string()
    .trim()
    .min(min, {
      message: min === 1 ? `${fieldName} הוא שדה חובה` : `${fieldName} חייב להכיל לפחות ${min} תווים`,
    })
    .max(max, { message: `${fieldName} יכול להכיל עד ${max} תווים` });

  return regex ? baseSchema.regex(regex, { message: regexMessage }) : baseSchema;
};

// Trimmed, lower-cased email address
export const emailField = z
  .string()
  .trim()
  .email('כתובת אימייל לא תקינה')
  .transform((value) => value.toLowerCase());
