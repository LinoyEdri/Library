import z from "zod"

type StringFieldOptions = {
    min: number,
    max: number,
    fieldName: string,
    regex?: RegExp,
    regexMessage?: string,
}

export const regexTypes = {
    alphaOnly: /^[A-Za-z\s-]+$/,
    digitsOnly: /^\d+$/,
} as const;

export const createStringField = (
    {
        min, max, fieldName, regex, regexMessage
    }: StringFieldOptions) => {
    const baseSchema = z
        .string()
        .trim()
        .min(min, { message: `${fieldName} must be at least ${min} characters long` })
        .max(max, { message: `${fieldName} cannot exceed ${max} characters` });

    return regex 
        ? baseSchema.regex(regex, { message: regexMessage })
        : baseSchema;
}

export const createEmailField = z
    .string()
    .trim()
    .email('Invalid email address')
    .transform((val) => val.toLowerCase());