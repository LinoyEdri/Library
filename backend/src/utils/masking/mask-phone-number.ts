// "0521234567" -> "052-***-4567": the prefix and the last 4 digits only
export const maskPhoneNumber = (phoneNumber: string): string =>
  `${phoneNumber.slice(0, 3)}-***-${phoneNumber.slice(-4)}`;
