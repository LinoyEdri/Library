const DEFAULT_MAXIMUM_LENGTH = 80;

// Shortens long text for table cells: "A very long bio..." (empty text becomes "—")
export const truncateText = (
  text: string | null | undefined,
  maximumLength = DEFAULT_MAXIMUM_LENGTH,
): string => {
  if (!text) {
    return '—';
  }

  return text.length > maximumLength ? `${text.slice(0, maximumLength)}…` : text;
};
