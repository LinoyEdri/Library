import type { ChangeEvent } from 'react';
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';

type UseFormTextFieldOptions<FormValues extends FieldValues> = {
  name: Path<FormValues>;
  control: Control<FormValues>;
  emptyAsUndefined: boolean;
};

// Connects a text input to React Hook Form and exposes its value and validation error
export const useFormTextField = <FormValues extends FieldValues>({
  name,
  control,
  emptyAsUndefined,
}: UseFormTextFieldOptions<FormValues>) => {
  const { field, fieldState } = useController({ name, control });

  // Empty input becomes undefined for optional fields (e.g. postal code)
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const enteredValue = event.target.value;

    field.onChange(emptyAsUndefined && enteredValue === '' ? undefined : enteredValue);
  };

  return {
    fieldName: field.name,
    fieldValue: field.value ?? '',
    fieldRef: field.ref,
    handleBlur: field.onBlur,
    handleChange,
    errorMessage: fieldState.error?.message,
  };
};
