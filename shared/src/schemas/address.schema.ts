import { z } from "zod";
import { createStringField, regexTypes } from "./schema-field-helpers.js";

// Postal address used by registration, profile and member forms
export const addressSchema = z.object({
    street: createStringField({
        min: 1,
        max: 255,
        fieldName: "Street",
        regex: regexTypes.lettersOnly,
        regexMessage: "Street name must contain letters only",
    }),

    houseNumber: createStringField({
        min: 1,
        max: 50,
        fieldName: "House number",
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
        regex: regexTypes.lettersOnly,
        regexMessage: "City name must contain letters only",
    }),

    postalCode: createStringField({
        min: 1,
        max: 7,
        fieldName: "Postal code",
        regex: regexTypes.digitsOnly,
        regexMessage: "Postal code must contain digits only",
    }).nullable().optional(),

    country: createStringField({
        min: 1,
        max: 100,
        fieldName: "Country",
        regex: regexTypes.lettersOnly,
        regexMessage: "Country name must contain letters only",
    }).default("Israel"),
});

export type AddressInput = z.infer<typeof addressSchema>;
