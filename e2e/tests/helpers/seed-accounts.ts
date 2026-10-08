// Accounts created by the backend seed (all log in with SEED_PASSWORD)
export const SeedAccounts = {
  admin: { email: 'admin@library.local', firstName: 'שרה' },
  librarian: { email: 'librarian@library.local', firstName: 'דוד' },
  // Used by the loan tests
  memberDana: { email: 'dana.cohen@example.com', firstName: 'דנה' },
  // Disabled and reactivated by the "disabled member" test
  memberMichal: { email: 'michal.avraham@example.com', firstName: 'מיכל' },
  // Resets her password in the password reset test (not used by any other test)
  memberUri: { email: 'uri.mizrahi@example.com', firstName: 'אורי', phoneNumber: '050-666-7788' },
} as const;

// Seeded books used by the tests
export const SeedBooks = {
  // 3 available copies; lent and returned by the loan test
  loanedBook: 'סיפור על אהבה וחושך',
  // Disabled and reactivated by the books test
  disabledBook: 'רומן רוסי',
} as const;
