import { z } from 'zod';
import { HebrewTexts } from '../../constants/hebrew-texts';

const referenceOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
});

// New loan form: the pickers hold { id, label } choices; a book or a barcode (or both) is needed
export const newLoanFormSchema = z
  .object({
    member: referenceOptionSchema
      .nullable()
      .refine((member) => member !== null, { message: HebrewTexts.loans.memberRequired }),

    book: referenceOptionSchema.nullable(),

    barcode: z.string().trim().max(50),
  })
  .refine((loan) => loan.book !== null || loan.barcode !== '', {
    message: HebrewTexts.loans.bookOrBarcodeRequired,
    path: ['book'],
  });

export type NewLoanFormInput = z.input<typeof newLoanFormSchema>;
export type NewLoanFormOutput = z.output<typeof newLoanFormSchema>;
