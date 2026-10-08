import { RecordStatus } from '@prisma/client';

// Of the requested ids, returns those that cannot be linked to a book:
// ids that do not exist, and disabled records that were not already linked before
export const findUnusableReferenceIds = (
  requestedIds: string[],
  foundRecords: { id: string; status: RecordStatus }[],
  alreadyLinkedIds: Set<string>,
): string[] => {
  const statusById = new Map(foundRecords.map((record) => [record.id, record.status]));

  return requestedIds.filter((requestedId) => {
    const status = statusById.get(requestedId);

    if (status === undefined) {
      return true;
    }

    return status === RecordStatus.DISABLED && !alreadyLinkedIds.has(requestedId);
  });
};
