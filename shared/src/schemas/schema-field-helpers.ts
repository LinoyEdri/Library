import { z } from 'zod';

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

// Trimmed string with length limits and an optional pattern
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
    .min(min, { message: `${fieldName} must be at least ${min} characters long` })
    .max(max, { message: `${fieldName} cannot exceed ${max} characters` });

  return regex ? baseSchema.regex(regex, { message: regexMessage }) : baseSchema;
};

// Trimmed, lower-cased email address
export const emailField = z
  .string()
  .trim()
  .email('Invalid email address')
  .transform((value) => value.toLowerCase());
