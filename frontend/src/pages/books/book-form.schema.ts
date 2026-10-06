import { z } from 'zod';
import { bookDetailsSchema } from '@library/shared';
import { HebrewTexts } from '../../constants/hebrew-texts';

const referenceOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
});

const bookFields = bookDetailsSchema.shape;

// Book form: the same field rules as the API, but the pickers hold { id, label } choices
export const bookFormSchema = z.object({
  title: bookFields.title,
  isbn: bookFields.isbn,
  publicationYear: bookFields.publicationYear,
  language: bookFields.language,
  imageUrl: bookFields.imageUrl,
  description: bookFields.description,

  publisher: referenceOptionSchema
    .nullable()
    .refine((publisher) => publisher !== null, { message: HebrewTexts.books.publisherRequired }),

  authors: z.array(referenceOptionSchema).min(1, { message: HebrewTexts.books.authorsRequired }),

  categories: z.array(referenceOptionSchema),
});

export type BookFormInput = z.input<typeof bookFormSchema>;
export type BookFormOutput = z.output<typeof bookFormSchema>;
