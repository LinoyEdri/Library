// "054-333 4455" -> "0543334455", so phone searches match however the number is typed
export const keepDigitsOnly = (text: string): string => text.replace(/\D/g, '');
