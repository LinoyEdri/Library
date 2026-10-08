// How long the 6-digit code sent by email/SMS works
export const PASSWORD_RESET_CODE_LIFETIME_MINUTES = 5;

// How long the reset page works after the right code was typed
export const PASSWORD_RESET_SESSION_LIFETIME_MINUTES = 5;

// Wrong codes allowed before the request closes and a new code is needed
export const PASSWORD_RESET_MAX_CODE_ATTEMPTS = 5;

// Stored in the audit entry's context, so a reset is told apart from a normal password change
export const PASSWORD_RESET_AUDIT_SOURCE = 'PASSWORD_RESET';
