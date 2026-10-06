import { useEffect, useState } from 'react';

const DEFAULT_DEBOUNCE_MILLISECONDS = 300;

// Returns the value only after it stopped changing for a moment (e.g. while typing a search)
export const useDebouncedValue = <Value>(
  value: Value,
  delayMilliseconds = DEFAULT_DEBOUNCE_MILLISECONDS,
): Value => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delayMilliseconds);

    return () => clearTimeout(timeoutId);
  }, [value, delayMilliseconds]);

  return debouncedValue;
};
