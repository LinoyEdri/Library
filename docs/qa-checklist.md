# QA Checklist

A manual pass through the app, role by role. Run it on freshly seeded data (`npm run db:seed`) with `npm run dev`, at http://localhost:3000. Every seeded account uses `SEED_PASSWORD`.

Tick each line when the result matches. Items marked **(E2E)** are also covered by the automated Playwright suite (`npm run test:e2e`), so check them by hand only before a release.

## Everywhere

- [x] The page is right-to-left Hebrew; text, tables, menus and dialogs align to the right. **(E2E)**
- [x] Every button, label, message and validation error is in Hebrew.
- [x] On a phone-width window the side menu becomes a drawer opened from the top bar.
- [x] With the backend stopped, opening another page from the menu shows only the page title, "אין חיבור לשרת" and "נסו שוב" (the menu stays). Reloading shows the same on a plain screen, without logging out. After the backend restarts, "נסו שוב" brings the page back. **(E2E)**
- [x] Opening an address that does not exist shows the "העמוד לא נמצא" page.

## Guest (logged out)

- [x] A wrong password shows one generic message, the same for an unknown email. **(E2E)**
- [x] Any app address (e.g. `/loans`) sends you to the login page. **(E2E)**
- [x] The apartment field is marked "(לא חובה)" in sign-up, profile, member and user forms; saving without it works, and details pages show "הרצל 12" without "דירה".
- [x] Sign-up with missing or invalid fields shows Hebrew errors under each field; a valid sign-up lets you log in as a guest (אורח). **(E2E: login after sign-up)**
- [x] **Forgot password:** "שכחת סיסמה?" → choose email or SMS.
  - [x] An unknown email/phone shows "אינו רשום במערכת". **(E2E: email)**
  - [x] A known one shows "שלחנו קוד…" with the masked address (`052-***-4567`, left to right), a 5:00 countdown, and a message popup with the code. **(E2E: SMS)**
  - [x] A wrong code shows "הקוד שגוי"; the right code opens the reset page. **(E2E)**
  - [x] "שליחת קוד חדש" replaces the popup and restarts the countdown; the old code no longer works.
  - [x] When a countdown reaches 0:00 you land on login with the reason as a toast.
  - [x] After a reset, only the new password works. **(E2E)**

## Viewer (sign up a new account)

- [x] Lands on the books catalog; the menu has only "עיון בספרים" and "פרופיל".
- [x] `/dashboard`, `/loans`, `/members` open the unauthorized page.
- [x] Can edit name, phone and address in the profile and change the password.

## Member (`dana.cohen@example.com`)

- [x] The menu has dashboard, browse books, loans and profile; no members, users, audit log or settings. **(E2E)**
- [x] The dashboard shows open, overdue and pending-return counts, "מתוך 5 מותרות", and her open loans.
- [x] Catalog search by title, author or ISBN narrows the cards; filters and availability chips work. **(E2E: search)**
- [x] "ההשאלות שלי" lists only her loans.
- [x] "בקשת החזרה" on an active loan changes it to "ממתינה להחזרה"; "ביטול בקשת החזרה" changes it back. **(E2E: request)**
- [x] Opening another member's loan address shows the unauthorized page.

## Librarian (`librarian@library.local`)

- [x] The menu has dashboard, books, members and loans; no users, audit log or settings. **(E2E)**
- [x] `/users` opens the unauthorized page. **(E2E)**
- [x] **Books:** create a book with authors and categories, edit it, add a copy, mark a copy damaged/lost and back. There is no disable button for books. **(E2E: no disable)**
- [x] **Members:** search by name, email and phone (with or without dashes); create a member from an existing guest and from a new person; edit; disable (the account becomes a guest) and reactivate.
- [x] **Loans:** "השאלה חדשה" by book or by barcode creates a loan with a due date 14 days ahead; the copy becomes "מושאל". **(E2E)**
  - [x] Errors: unknown barcode, copy already on loan, no available copy, member at the loan limit, disabled member, disabled book. **(E2E: disabled member, via the API)**
- [x] "בקשות החזרה" lists requested returns; "קליטת החזרה" with intact/damaged/lost closes the loan and sets the copy. **(E2E)**
- [x] "ביטול השאלה" cancels and puts the copy back.
- [x] The loan details page shows the timeline (lent, requested, returned).
- [x] An overdue loan (due date in the past) shows its date in red and appears under "באיחור" and on the dashboard.

## Admin (`admin@library.local`)

- [x] Sees every menu item. **(E2E)**
- [x] **Books:** disable a book (with confirmation) and reactivate it; authors, publishers and categories can be created, edited, disabled and reactivated. **(E2E: book disable/reactivate)**
- [x] **Users:** create users of every role except admin; change a role (to MEMBER creates or reactivates the membership); cannot change their own role or status.
- [x] **Single admin:** choosing "מנהל מערכת" (role change or new user) opens a warning; cancel changes nothing. Confirming logs you out with a toast. The other account is now the admin, and yours appears as a disabled guest; reactivating it gives a guest (אורח), not an admin. Making a disabled account admin is refused.
- [x] **Settings:** change the loan period and the maximum loans; invalid values are refused; a new loan uses the new period.
- [x] **Dashboard:** library totals and "פעולות אחרונות" with Hebrew action names.
- [x] **Audit log:** filters by action, record type, user, entry number and dates (an end date before the start date is flagged); rows show names, not ids; the side panel shows before/after values (changes highlighted) and context in Hebrew; empty sections are hidden.
- [x] Adding, editing or deleting an audit row in Prisma Studio fails.

## Accessibility

- [x] Every form field has a visible label; the whole app can be used with the keyboard (Tab, Enter, Esc closes dialogs).
- [x] No serious axe problems on the main pages, including color contrast. **(E2E)**
