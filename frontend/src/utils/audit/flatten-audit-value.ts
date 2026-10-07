const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// A stored JSON value as "field path -> value", one level of nesting deep per object,
// e.g. { address: { city: 'חיפה' } } -> { 'address.city': 'חיפה' }. A non-object becomes { value }.
export const flattenAuditValue = (
  storedValue: unknown,
  pathPrefix = '',
): Record<string, unknown> => {
  if (storedValue === null || storedValue === undefined) {
    return {};
  }

  if (!isPlainObject(storedValue)) {
    return { [pathPrefix || 'value']: storedValue };
  }

  const flattenedFields: Record<string, unknown> = {};

  for (const [fieldName, fieldValue] of Object.entries(storedValue)) {
    const fieldPath = pathPrefix ? `${pathPrefix}.${fieldName}` : fieldName;

    if (isPlainObject(fieldValue)) {
      Object.assign(flattenedFields, flattenAuditValue(fieldValue, fieldPath));
    } else {
      flattenedFields[fieldPath] = fieldValue;
    }
  }

  return flattenedFields;
};
