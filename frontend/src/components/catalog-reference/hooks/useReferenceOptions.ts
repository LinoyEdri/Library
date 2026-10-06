import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import type { ReferenceOptionSource } from '../reference-option.types';

// Text typed in a picker and the matching choices from the server
export const useReferenceOptions = (source: ReferenceOptionSource) => {
  const [inputText, setInputText] = useState('');

  const debouncedInputText = useDebouncedValue(inputText.trim());

  const optionsQuery = useQuery({
    queryKey: [...source.queryKey, debouncedInputText],
    queryFn: () => source.loadOptions(debouncedInputText),
    placeholderData: keepPreviousData,
  });

  return {
    inputText,
    setInputText,
    options: optionsQuery.data ?? [],
    isLoading: optionsQuery.isFetching,
  };
};
