import type { Control, FieldValues, Path } from 'react-hook-form';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import { useFormTextField } from './hooks/useFormTextField';

type FormTextFieldProps<FormValues extends FieldValues, SubmittedValues> = Omit<
  TextFieldProps,
  'name'
> & {
  name: Path<FormValues>;
  control: Control<FormValues, unknown, SubmittedValues>;
  // Empty input becomes undefined (for optional fields such as postal code)
  emptyAsUndefined?: boolean;
};

// MUI text field connected to React Hook Form, showing the field's validation message
export function FormTextField<FormValues extends FieldValues, SubmittedValues = FormValues>({
  name,
  control,
  emptyAsUndefined = false,
  ...textFieldProps
}: FormTextFieldProps<FormValues, SubmittedValues>) {
  const { fieldName, fieldValue, fieldRef, handleBlur, handleChange, errorMessage } =
    useFormTextField({ name, control, emptyAsUndefined });

  return (
    <TextField
      {...textFieldProps}
      name={fieldName}
      inputRef={fieldRef}
      value={fieldValue}
      onBlur={handleBlur}
      onChange={handleChange}
      error={Boolean(errorMessage)}
      helperText={errorMessage ?? textFieldProps.helperText}
    />
  );
}
