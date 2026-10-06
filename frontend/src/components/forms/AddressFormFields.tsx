import type { Control, FieldValues, Path } from 'react-hook-form';
import Box from '@mui/material/Box';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { FormTextField } from './FormTextField';

type AddressFormFieldsProps<FormValues extends FieldValues, SubmittedValues> = {
  // A form that has an `address` object (street, houseNumber, apartmentOrUnit, city, postalCode)
  control: Control<FormValues, unknown, SubmittedValues>;
};

const twoColumnRowStyle = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: {
    sm: '1fr 1fr',
  },
};

const threeColumnRowStyle = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: {
    sm: '1fr 1fr 1fr',
  },
};

// City, street, house number, apartment and postal code fields of a form's `address`
export function AddressFormFields<FormValues extends FieldValues, SubmittedValues>({
  control,
}: AddressFormFieldsProps<FormValues, SubmittedValues>) {
  const { addressFields } = HebrewTexts;

  return (
    <>
      <Box sx={twoColumnRowStyle}>
        <FormTextField
          control={control}
          name={'address.city' as Path<FormValues>}
          label={addressFields.city}
        />

        <FormTextField
          control={control}
          name={'address.street' as Path<FormValues>}
          label={addressFields.street}
        />
      </Box>

      <Box sx={threeColumnRowStyle}>
        <FormTextField
          control={control}
          name={'address.houseNumber' as Path<FormValues>}
          label={addressFields.houseNumber}
        />

        <FormTextField
          control={control}
          name={'address.apartmentOrUnit' as Path<FormValues>}
          label={addressFields.apartmentOrUnit}
        />

        <FormTextField
          control={control}
          name={'address.postalCode' as Path<FormValues>}
          label={addressFields.postalCode}
          emptyAsUndefined
        />
      </Box>
    </>
  );
}
