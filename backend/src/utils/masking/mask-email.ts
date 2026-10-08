// "dana.cohen@example.com" -> "d***@example.com" (shows where a code went without revealing it)
export const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split('@');

  return `${localPart.charAt(0)}***@${domain}`;
};
