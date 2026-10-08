import type { AddressResponse } from '@library/shared';
import { HebrewTexts } from '../constants/hebrew-texts';

// "הרצל 12, דירה 4", or just "הרצל 12" for a private house
export const formatStreetAddress = (address: AddressResponse): string => {
  const streetAndNumber = `${address.street} ${address.houseNumber}`;

  return address.apartmentOrUnit
    ? `${streetAndNumber}, ${HebrewTexts.addressFields.apartmentPrefix} ${address.apartmentOrUnit}`
    : streetAndNumber;
};
