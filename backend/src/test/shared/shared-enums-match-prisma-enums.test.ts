import { describe, expect, it } from 'vitest';
import * as PrismaEnums from '@prisma/client';
import * as SharedEnums from '@library/shared';

// The shared package mirrors Prisma enums by hand, so this test catches any drift
const enumNamesToCompare = [
  'Role',
  'RecordStatus',
  'CopyStatus',
  'LoanStatus',
  'EntityType',
  'ActionType',
] as const;

const sortedValuesOf = (enumObject: Record<string, string>) => Object.values(enumObject).sort();

describe('shared enums match Prisma enums', () => {
  it.each(enumNamesToCompare)('%s has the same values in shared and Prisma', (enumName) => {
    const prismaEnumValues = sortedValuesOf(PrismaEnums[enumName]);

    const sharedEnumValues = sortedValuesOf(SharedEnums[enumName]);

    expect(sharedEnumValues).toEqual(prismaEnumValues);
  });
});
