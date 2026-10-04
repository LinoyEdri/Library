import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';
import TextField, { type TextFieldProps } from '@mui/material/TextField';

type FormTextFieldProps<FormValues extends FieldValues> = Omit<TextFieldProps, 'name'> & {
  name: Path<FormValues>;
  control: Control<FormValues>;
  // Empty input becomes undefined (for optional fields such as postal code)
  emptyAsUndefined?: boolean;
};

// MUI text field connected to React Hook Form, showing the field's validation message
export function FormTextField<FormValues extends FieldValues>({
  name,
  control,
  emptyAsUndefined = false,
  ...textFieldProps
}: FormTextFieldProps<FormValues>) {
  const { field, fieldState } = useController({ name, control });

  return (
    <TextField
      {...textFieldProps}
      name={field.name}
      inputRef={field.ref}
      value={field.value ?? ''}
      onBlur={field.onBlur}
      onChange={(event) => {
        const enteredValue = event.target.value;

        field.onChange(emptyAsUndefined && enteredValue === '' ? undefined : enteredValue);
      }}
      error={Boolean(fieldState.error)}
      helperText={fieldState.error?.message ?? textFieldProps.helperText}
    />
  );
}
