// Turns grouped counts into a record with every key, so missing groups show as 0
export const buildCountByKey = <Key extends string>(
  allKeys: readonly Key[],
  groups: { key: Key; count: number }[],
): Record<Key, number> => {
  const countByKey = Object.fromEntries(allKeys.map((key) => [key, 0])) as Record<Key, number>;

  for (const group of groups) {
    countByKey[group.key] = group.count;
  }

  return countByKey;
};
