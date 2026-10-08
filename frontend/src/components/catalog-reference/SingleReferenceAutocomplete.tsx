import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useReferenceOptions } from './hooks/useReferenceOptions';
import type { ReferenceOption, ReferenceOptionSource } from './reference-option.types';

type SingleReferenceAutocompleteProps = {
  source: ReferenceOptionSource;
  label: string;
  value: ReferenceOption | null;
  onChange: (selectedOption: ReferenceOption | null) => void;
  errorMessage?: string;
};

// Searchable picker for one author, category or publisher
export function SingleReferenceAutocomplete({
  source,
  label,
  value,
  onChange,
  errorMessage,
}: SingleReferenceAutocompleteProps) {
  const { setInputText, options, isLoading } = useReferenceOptions(source);

  return (
    <Autocomplete
      value={value}
      onChange={(_event, selectedOption) => onChange(selectedOption)}
      onInputChange={(_event, typedText) => setInputText(typedText)}
      options={options}
      loading={isLoading}
      filterOptions={(serverFilteredOptions) => serverFilteredOptions}
      isOptionEqualToValue={(option, selectedOption) => option.id === selectedOption.id}
      getOptionLabel={(option) => option.label}
      renderInput={(inputProps) => (
        <TextField
          {...inputProps}
          label={label}
          error={Boolean(errorMessage)}
          helperText={errorMessage}
        />
      )}
    />
  );
}
