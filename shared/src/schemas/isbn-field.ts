import { z } from 'zod';

// Removes spaces and hyphens: "978-965-00-0001-1" -> "9789650000011"
export const normalizeIsbn = (isbn: string): string => isbn.replace(/[\s-]/g, '').toUpperCase();

// ISBN-10: 9 digits + check digit (0-9 or X), weighted 10..1, sum divisible by 11
const isValidIsbn10 = (isbn: string): boolean => {
  if (!/^\d{9}[\dX]$/.test(isbn)) {
    return false;
  }

  const weightedSum = [...isbn].reduce((sum, character, index) => {
    const digitValue = character === 'X' ? 10 : Number(character);

    return sum + digitValue * (10 - index);
  }, 0);

  return weightedSum % 11 === 0;
};

// ISBN-13: 13 digits, weights alternate 1 and 3, sum divisible by 10
const isValidIsbn13 = (isbn: string): boolean => {
  if (!/^\d{13}$/.test(isbn)) {
    return false;
  }

  const weightedSum = [...isbn].reduce(
    (sum, character, index) => sum + Number(character) * (index % 2 === 0 ? 1 : 3),
    0,
  );

  return weightedSum % 10 === 0;
};

export const isValidIsbn = (isbn: string): boolean => isValidIsbn10(isbn) || isValidIsbn13(isbn);

// Optional ISBN: stored without hyphens; empty input becomes null
export const optionalIsbnField = z
  .string()
  .trim()
  .nullable()
  .optional()
  .transform((value) => (value ? normalizeIsbn(value) : null))
  .refine((isbn) => isbn === null || isValidIsbn(isbn), {
    message: 'מספר ISBN לא תקין (10 או 13 ספרות עם ספרת ביקורת נכונה)',
  });
