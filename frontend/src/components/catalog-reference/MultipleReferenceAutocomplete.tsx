import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useReferenceOptions } from './hooks/useReferenceOptions';
import type { ReferenceOption, ReferenceOptionSource } from './reference-option.types';

type MultipleReferenceAutocompleteProps = {
  source: ReferenceOptionSource;
  label: string;
  value: ReferenceOption[];
  onChange: (selectedOptions: ReferenceOption[]) => void;
  helperText?: string;
  errorMessage?: string;
};

// Searchable picker for several authors or categories; selected ones show as chips in order
export function MultipleReferenceAutocomplete({
  source,
  label,
  value,
  onChange,
  helperText,
  errorMessage,
}: MultipleReferenceAutocompleteProps) {
  const { setInputText, options, isLoading } = useReferenceOptions(source);

  return (
    <Autocomplete
      multiple
      value={value}
      onChange={(_event, selectedOptions) => onChange(selectedOptions)}
      onInputChange={(_event, typedText) => setInputText(typedText)}
      options={options}
      loading={isLoading}
      filterOptions={(serverFilteredOptions) => serverFilteredOptions}
      filterSelectedOptions
      isOptionEqualToValue={(option, selectedOption) => option.id === selectedOption.id}
      getOptionLabel={(option) => option.label}
      renderInput={(inputProps) => (
        <TextField
          {...inputProps}
          label={label}
          error={Boolean(errorMessage)}
          helperText={errorMessage ?? helperText}
        />
      )}
    />
  );
}
