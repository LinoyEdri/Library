import { z } from "zod";
import { addressSchema } from "./address.schema.js";
import { createStringField, emailField, regexTypes } from "./schema-field-helpers.js";

// Password rules for new passwords (registration, change password)
export const newPasswordField = createStringField({
    min: 8,
    max: 128,
    fieldName: "Password",
});

// Body of POST /auth/register
export const registerSchema = z.object({
    firstName: createStringField({
        min: 1,
        max: 100,
        fieldName: "First name",
        regex: regexTypes.lettersOnly,
        regexMessage: "First name must contain letters only",
    }),

    lastName: createStringField({
        min: 1,
        max: 100,
        fieldName: "Last name",
        regex: regexTypes.lettersOnly,
        regexMessage: "Last name must contain letters only",
    }),

    email: emailField,

    password: newPasswordField,

    phoneNumber: createStringField({
        min: 9,
        max: 10,
        fieldName: "Phone number",
        regex: regexTypes.digitsOnly,
        regexMessage: "Phone number must contain digits only",
    }),

    address: addressSchema,
});

// Body of POST /auth/login - only presence is checked, so failures stay generic
export const loginSchema = z.object({
    email: emailField,

    password: z.string().min(1, { message: "Password is required" }).max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
