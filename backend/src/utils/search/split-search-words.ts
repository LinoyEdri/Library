// "  דנה   כהן " -> ["דנה", "כהן"]: each word is matched on its own, so full names work
export const splitSearchWords = (searchText: string | undefined): string[] =>
  (searchText ?? '').trim().split(/\s+/).filter(Boolean);
