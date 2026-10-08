import { Prisma } from '@prisma/client';

// Field names that must never be stored in the audit log
const SENSITIVE_FIELD_NAMES = new Set(['passwordHash', 'password']);

// Converts a value to plain JSON (dates become ISO strings) and drops sensitive fields.
// Missing values become database NULL.
export const toAuditJsonValue = (value: unknown): Prisma.InputJsonValue | typeof Prisma.DbNull => {
  if (value === undefined || value === null) {
    return Prisma.DbNull;
  }

  const jsonText = JSON.stringify(value, (key, fieldValue) =>
    SENSITIVE_FIELD_NAMES.has(key) ? undefined : fieldValue,
  );

  return JSON.parse(jsonText) as Prisma.InputJsonValue;
};
