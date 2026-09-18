import { z } from 'zod';
import { createEmailField, createStringField, regexTypes } from './util.schema.ts';
import { Role } from '@prisma/client';

export const addressSchema = z.object({
  street: createStringField({
    min: 1, 
    max: 255, 
    fieldName: "Street", 
    regex: regexTypes.alphaOnly, 
    regexMessage: "Street name must contain letters only"
  }),
  houseNumber: createStringField({
    min: 1,
    max: 50,
    fieldName: "HouseNumber"
  }),
  apartmentOrUnit: createStringField({
    min: 1,
    max: 50,
    fieldName: "Apartment/Unit",
  }),
  city: createStringField({
    min: 1,
    max: 100,
    fieldName: "City",
    regex: regexTypes.alphaOnly,
    regexMessage: "City name must contain letters only"
  }),
  postalCode: createStringField({
    min: 1,
    max: 7,
    fieldName: "Postal Code",
    regex: regexTypes.digitsOnly,
    regexMessage: "Postal Code must contain digits only"
  }).nullable().optional(),
  country: createStringField({
    min: 1,
    max: 100,
    fieldName: "Country",
    regex: regexTypes.alphaOnly,
    regexMessage: "Country name must contain letters only"
  }).nullable().default('Israel').optional(),
});

export const registerSchema = z.object({
  firstName: createStringField({
    min: 1,
    max: 100,
    fieldName: "First name",
    regex: regexTypes.alphaOnly,
    regexMessage: "First name must contain letters only"
  }),
  lastName: createStringField({
    min: 1,
    max: 100,
    fieldName: "Last name",
    regex: regexTypes.alphaOnly,
    regexMessage: "Last name must contain letters only"
  }),
  email: z.string().trim().email('Invalid email address').transform((val) => val.toLowerCase()),
  password: createStringField({
    min: 8,
    max: 128,
    fieldName: "Password",
  }),
  phoneNumber: createStringField({
    min: 1,
    max: 10,
    fieldName: "Phone Number",
    regex: regexTypes.digitsOnly,
    regexMessage: "Phone Number must contain digits only"
  }),
  address: addressSchema,   
});

export const loginSchema = z.object({
  email: createEmailField,
  password: createStringField({
    min: 8,
    max: 128,
    fieldName: "Password",
  }),
});

export const accessTokenPayloadSchema = z.object({
  sub: z.string(),
  role: z.enum(Role),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;