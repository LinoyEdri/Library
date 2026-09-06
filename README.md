# Library Management System Requirements

## 1. Project Overview

The Library Management System is a local-only application for managing library books, physical book copies, members, users, loans, returns, and operational information.

The system is designed for use on a single computer and will not require cloud deployment or external hosting.

The interface will be:

- Hebrew-language
- Fully right-to-left (RTL)
- Responsive for desktop, tablet, and mobile screens
- Designed with a modern “Contemporary Digital Library” visual style
- Based on Material UI principles
- Built with the Heebo font

---

## 2. Project Goals

The system must allow authorized users to:

- Manage books and their physical copies
- Manage library members
- Create and manage loans
- Process return requests and physical returns
- Monitor overdue loans
- Enforce role-based access control
- Preserve historical data
- Maintain audit records for important actions
- Provide different dashboards according to the user’s role

The system must prioritize data integrity, clear permissions, usability, and secure backend authorization.

---

## 3. User Roles

The system has three roles:

```
ADMIN
LIBRARIAN
MEMBER
```

### 3.1 Admin

The Admin has full access to the system.

Admins can:

- View the full system dashboard
- Manage users and roles
- Create, view, edit, disable, and reactivate books
- Manage physical book copies
- Create, view, edit, disable, and reactivate members
- View and manage loans
- Create loans
- Confirm and process physical returns
- View overdue loans
- View audit logs
- Manage system settings
- Manage their own profile

### 3.2 Librarian

The Librarian manages daily library operations.

Librarians can:

- View the operational dashboard
- View books and book details
- Create books
- Edit book information
- View physical book copies
- Create physical book copies, if permitted by the implementation
- View members and member details
- Create members
- View loans
- Create loans
- Confirm and process physical returns
- View overdue loans
- Manage their own profile

Librarians cannot:

- Disable books
- Reactivate books
- Edit existing members
- Disable members
- Reactivate members
- Manage users or roles
- View audit logs
- Manage system settings

### 3.3 Member

Members can:

- View the member dashboard
- Browse the book catalog
- Search and filter books
- View book details
- View book and copy availability
- View their own loans
- View their own loan details
- Request a return
- View overdue information for their own loans
- Manage their own profile
- Change their own password

Members cannot:

- Create loans directly
- Confirm physical returns
- Manage books
- Manage physical book copies
- Create or edit members
- View or manage other members
- View other members' loans
- View audit logs
- Access system settings
- Join a waiting list

---

## 4. Authentication and Accounts

### 4.1 User Accounts

A **User** is an authenticated account that can log in to the system.

A User record may contain:

- User ID
- Name
- Email or username
- Password hash
- Assigned role
- Account status
- Creation date
- Updated date
- Last login date

Passwords must never be stored as plain text.

### 4.2 Members

A **Member** is a person who can borrow books from the library.

A Member record may contain:

- Member ID
- Linked user account
- Full name
- Contact information
- Membership status
- Registration date
- Additional library information

User accounts and Member records should be logically separated, even when they belong to the same person.

### 4.3 Public Registration

Public registration must:

- Create a Member account by default
- Assign the `MEMBER` role automatically
- Prevent users from selecting the Admin or Librarian role
- Securely store the password
- Create the associated Member record
- Set the account status to `ACTIVE`

A user must never be able to register publicly as an Admin or Librarian.

### 4.4 Admin-Created Accounts

An Admin may create:

- Member accounts
- Librarian accounts
- Additional Admin accounts, if enabled by the implementation

Only authorized Admin actions may assign elevated roles.

### 4.5 Librarian-Created Members

A Librarian may create a new Member and, if required by the implementation, the associated Member login account.

A Librarian cannot create:

- Admin accounts
- Librarian accounts
- Accounts with elevated permissions

### 4.6 Account Status

Accounts may have one of the following statuses:

```
ACTIVE
DISABLED
```

An active account may log in and use permitted features.

A disabled account:

- Cannot log in
- Cannot create new loans
- Retains its historical data
- Retains its loan history
- Retains audit references
- Must not be physically deleted

Only an Admin can disable or reactivate user accounts.

---

## 5. Authorization and Security

Authorization must be enforced by the backend for every protected action.

Frontend restrictions alone are not sufficient.

The backend must verify:

- Whether the user is authenticated
- Whether the account is active
- The user's role
- Whether the user owns the requested resource
- Whether the requested action is allowed
- Whether the affected record is active
- Whether the business rules permit the operation

For example, hiding a "Disable Book" button from a Librarian is not sufficient. The backend must also reject any disable-book request made by a Librarian.

### 5.1 Frontend Authorization

The frontend should:

- Display role-specific navigation
- Hide unauthorized actions
- Hide unauthorized pages
- Display the correct dashboard for each role
- Redirect unauthorized users to the 403 Unauthorized page
- Prevent members from accessing other members' data

### 5.2 Backend Authorization

The backend must independently enforce:

- Role permissions
- Resource ownership
- Account status
- Book status
- Member status
- Physical-copy availability
- Loan status transitions
- Administrative restrictions

---

## 6. Data Preservation and Disabling

The system must not physically delete important records.

The word "Remove" must not represent permanent deletion.

The preferred operation is:

```text
Disable
```

Disabled records remain in the database to preserve:

- Audit history
- Loan history
- Referential integrity
- Historical reports
- Accountability
- Relationships between records

### 6.1 Disabled Books

Only Admins can disable or reactivate books.

A disabled book:

- Remains in the database
- Cannot receive new loans
- Retains its existing loan history
- Cannot be disabled by a Librarian
- Cannot be disabled by a Member

Disabling and reactivating a book must be recorded in the audit log.

### 6.2 Disabled Members

Only Admins can edit, disable, or reactivate members.

A disabled member:

- Remains in the database
- Cannot receive new loans
- Retains their loan history
- Cannot be physically deleted
- Cannot be edited or disabled by a Librarian

Disabling and reactivating a member must be recorded in the audit log.

### 6.3 Disabled Physical Copies

Physical copies may have their own operational status.

A disabled physical copy:

- Remains associated with its book
- Cannot be assigned to a new loan
- Retains its loan history
- Cannot be physically deleted when referenced by historical records

---

## 7. Books

A **Book** represents the general bibliographic information for a title.

A book may contain:

- Book ID
- Title
- Author
- ISBN
- Publisher
- Publication year
- Description
- Category
- Cover image
- General status
- Creation date
- Updated date

### 7.1 Book Permissions

| Action | Admin | Librarian | Member |
| --- | --- | --- | --- |
| View books | Yes | Yes | Yes |
| View book details | Yes | Yes | Yes |
| Create books | Yes | Yes | No |
| Edit books | Yes | Yes | No |
| Disable books | Yes | No | No |
| Reactivate books | Yes | No | No |

### 7.2 Book Rules

- Disabled books cannot receive new loans.
- Existing loan history must remain available.
- A book may have multiple physical copies.
- A book is considered available when at least one eligible physical copy is available.
- Book creation, editing, disabling, and reactivation must follow role restrictions.
- Important book actions must be recorded in the audit log.

---

## 8. Multiple Physical Book Copies

The system must support multiple physical copies of the same book.

For example, one book record may have several physical copies.

### 8.1 Book and Book Copy Distinction

A **Book** represents the general title and bibliographic information.

A **BookCopy** represents one specific physical item.

### 8.2 Book Copy Information

A physical copy may contain:

- Copy ID
- Associated book ID
- Barcode or inventory number
- Copy status
- Acquisition date
- Notes
- Creation date
- Updated date

### 8.3 Physical Copy Statuses

Recommended copy statuses are:

```
AVAILABLE
ON_LOAN
DISABLED
LOST
DAMAGED
```

Only an `AVAILABLE` physical copy can be assigned to a new loan.

A physical copy can have only one active loan at a time.

### 8.4 Copy Rules

- Each physical copy must belong to one book.
- Multiple copies may belong to the same book.
- A copy must have a unique identifier or inventory number.
- A disabled, lost, or damaged copy cannot be assigned to a new loan.
- A copy's historical loans must remain available.
- Copy-related changes must be recorded in the audit log when applicable.

---

## 9. Members

Members are library users who can borrow physical book copies.

### 9.1 Member Permissions

| Action | Admin | Librarian | Member |
| --- | --- | --- | --- |
| View member list | Yes | Yes | No |
| View member details | Yes | Yes | Own profile only |
| Create members | Yes | Yes | No |
| Edit members | Yes | No | Own permitted profile fields only |
| Disable members | Yes | No | No |
| Reactivate members | Yes | No | No |

### 9.2 Member Rules

- Members can view only their own personal data.
- Members can view only their own loan history.
- Members cannot view another member's loans.
- Disabled members cannot receive new loans.
- Member history must remain available after disabling.
- Only Admins can edit, disable, or reactivate existing member records.
- Librarians may view and create members but may not edit or disable existing members.

---

## 10. Loans

A loan connects:

- One Member
- One physical Book Copy
- One checkout date
- One due date
- One loan status

A loan may contain:

- Loan ID
- Member ID
- Book copy ID
- Checkout date
- Due date
- Return date
- Loan status
- Created by user
- Return-processed-by user
- Notes
- Creation date
- Updated date

### 10.1 Loan Statuses

The system must support the following loan statuses:

```
ACTIVE
RETURN_REQUESTED
RETURNED
OVERDUE
CANCELLED
```

### 10.2 Loan Permissions

| Action | Admin | Librarian | Member |
| --- | --- | --- | --- |
| View all loans | Yes | Yes | No |
| View own loans | Yes | Yes | Yes |
| Create loans | Yes | Yes | No |
| Request return | No | No | Yes |
| Confirm return | Yes | Yes | No |
| Cancel loans | Yes | Yes, if permitted by workflow | No |
| View overdue loans | Yes | Yes | Own loans only |

### 10.3 Loan Rules

- Only Admins and Librarians can create loans.
- Members cannot create loans directly.
- A disabled book cannot be used for a new loan.
- A disabled physical copy cannot be used for a new loan.
- A disabled member cannot receive a new loan.
- A physical copy can have only one active loan at a time.
- Loan creation must verify physical-copy availability.
- Loan creation must use a database transaction.
- Return processing must use a database transaction.
- Loan history must not be physically deleted.
- Important loan actions must be recorded in the audit log.

---

## 11. Return Workflow

The system must distinguish between a Member requesting a return and staff confirming the physical return.

### 11.1 Member Return Request

A Member may request a return for one of their own active or overdue loans.

The interface label must be:

```text
Request Return
```

A return request:

- Applies only to the logged-in Member's own loan
- Changes the loan status to `RETURN_REQUESTED`
- Does not mark the physical copy as returned
- Does not complete the loan
- Must be recorded in the audit log

### 11.2 Staff Return Confirmation

Only Admins and Librarians can confirm the physical return.

The interface label must be:

```text
Confirm Return
```

When staff confirm a return:

- The loan status changes to `RETURNED`
- The return date is recorded
- The physical copy becomes `AVAILABLE`
- The staff member who processed the return is recorded
- The action is recorded in the audit log

Members cannot confirm their own returns.

### 11.3 Loan Status Transitions

Permitted transitions include:

```text
ACTIVE           -> RETURN_REQUESTED
ACTIVE           -> RETURNED
ACTIVE           -> OVERDUE
RETURN_REQUESTED -> RETURNED
RETURN_REQUESTED -> CANCELLED
OVERDUE          -> RETURN_REQUESTED
OVERDUE          -> RETURNED
```

The backend must reject invalid status transitions.

---

## 12. Overdue Loans

The system does not include fines or overdue fees.

When a loan passes its due date and has not been returned:

- The loan is identified as overdue.
- The loan may receive the `OVERDUE` status.
- An overdue message is shown to the Member.
- An overdue message is shown to Librarians.
- An overdue message is shown to Admins.
- No monetary fee is calculated.
- No payment functionality is provided.
- No fine-management functionality is provided.

### 12.1 Overdue Visibility

Members can view overdue information only for their own loans.

Librarians and Admins can view overdue information for all relevant loans.

The overdue state may be calculated using:

- Due date
- Current date
- Return status

---

## 13. Waiting Lists

Waiting lists are not included in the first version.

Members cannot:

- Join a waiting list
- Leave a waiting list
- View waiting-list positions
- Receive waiting-list notifications

Waiting-list functionality may be added in a future version.

---

## 14. Notifications

Notifications are not included in the first version.

The system will not provide:

- Email notifications
- SMS notifications
- Push notifications
- Automatic reminders
- Waiting-list notifications
- External overdue notifications

Overdue information will be displayed only inside the application.

---

## 15. Audit Logs

Audit logs are append-only records of important system actions.

Audit-log records must not be modified or deleted through the normal application interface.

### 15.1 Audit Log Access

| Action | Admin | Librarian | Member |
| --- | --- | --- | --- |
| View audit logs | Yes | No | No |
| Search audit logs | Yes | No | No |
| Filter audit logs | Yes | No | No |
| Create audit records through actions | Yes | Yes | Yes, when applicable |
| Edit audit logs | No | No | No |
| Delete audit logs | No | No | No |

Librarian actions must still be recorded even though Librarians cannot view audit logs.

Member actions may also be recorded, but Members cannot view audit logs.

### 15.2 Actions That Require Audit Logging

The system should record actions such as:

- User creation
- User login and logout security events
- Role assignment
- User disabling
- User reactivation
- Book creation
- Book editing
- Book disabling
- Book reactivation
- Physical-copy creation
- Physical-copy editing
- Physical-copy disabling
- Member creation
- Member editing
- Member disabling
- Member reactivation
- Loan creation
- Return requests
- Return confirmation
- Loan cancellation
- Changes to system settings
- Other security-sensitive actions

### 15.3 Audit Entry Information

An audit entry should include:

- Audit entry ID
- Action type
- Acting user ID
- Acting user role
- Affected entity type
- Affected record ID
- Date and time
- Previous values, when applicable
- New values, when applicable
- Additional context, when applicable

---

## 16. Dashboards

The system must provide role-specific dashboards.

### 16.1 Admin Dashboard

The Admin dashboard may display:

- Total books
- Total physical copies
- Available copies
- Active loans
- Overdue loans
- Return requests
- Total members
- Disabled books
- Disabled members
- Recent administrative activity

### 16.2 Librarian Dashboard

The Librarian dashboard may display:

- Available physical copies
- Active loans
- Overdue loans
- Pending return requests
- Recently created members
- Recently created books
- Daily operational statistics

The Librarian dashboard must not display audit-log functionality.

### 16.3 Member Dashboard

The Member dashboard may display:

- Active loans
- Overdue personal loans
- Pending return requests
- Recently returned books
- Available books
- Quick access to personal loans
- Quick access to the book catalog

The Member dashboard must not display administrative or staff controls.

---

## 17. Required Pages

### 17.1 Public Pages

- Login
- Sign up
- Unauthorized (403)
- Not found (404)

Additional password-recovery pages may be added if included in the implementation:

- Forgot password
- Reset password

### 17.2 Shared Authenticated Pages

- Profile
- Change password
- Logout functionality

### 17.3 Admin Pages

- Admin dashboard
- Books list
- Book details
- Create book
- Edit book
- Disable book
- Reactivate book
- Physical-copy management
- Members list
- Member details
- Create member
- Edit member
- Disable member
- Reactivate member
- Loans list
- Loan details
- Create loan
- Confirm return
- Users list
- User details
- Create user
- Edit user
- Disable or reactivate user
- Role management
- Audit logs
- System settings

### 17.4 Librarian Pages

- Librarian dashboard
- Books list
- Book details
- Create book
- Edit book
- Physical-copy viewing and management, according to permission rules
- Members list
- Member details
- Create member
- Loans list
- Loan details
- Create loan
- Confirm return
- Profile

Librarians must not have access to:

- Audit logs
- User management
- Role management
- System settings
- Book disable/reactivate actions
- Member edit/disable/reactivate actions

### 17.5 Member Pages

- Member dashboard
- Books catalog
- Book details
- Personal loans list
- Personal loan details
- Request return
- Profile
- Change password

Members must not have access to administrative or staff-management pages.

---

## 18. Interface and Design Requirements

The interface must follow the "Contemporary Digital Library" visual theme.

### 18.1 Colors

- Warm ivory background: `#F8F6F1`
- Deep navy: `#17324D`
- Forest green: `#2F6B5F`
- Muted gold: `#C49A5A`

### 18.2 Layout

The interface must be:

- Fully RTL
- Hebrew-language
- Responsive
- Right-aligned
- Usable on desktop, tablet, and mobile
- Organized with clear spacing
- Based on rounded cards and subtle shadows
- Suitable for a municipal or academic library environment

### 18.3 Typography

The primary font is:

```
Heebo
```

### 18.4 Role-Specific Interfaces

The interface must display only the features appropriate to the current role.

Examples:

- Members must not see administrative controls.
- Librarians must not see audit-log controls.
- Librarians must not see book disable/reactivate controls.
- Librarians must not see member edit/disable controls.
- Admins must have access to all authorized administrative functions.

Frontend hiding improves usability but does not replace backend authorization.

---

## 19. Validation and Error Handling

The system must validate:

- Required fields
- Email or username format
- Password requirements
- Duplicate ISBN values, when applicable
- Duplicate copy identifiers
- Duplicate user accounts
- Duplicate member accounts, when applicable
- Valid due dates
- Physical-copy availability
- Book status
- Member status
- Loan status transitions
- User permissions

The system must display clear error messages in Hebrew.

The system must provide dedicated responses for:

- Unauthenticated users
- Unauthorized users
- Missing records
- Invalid operations
- Disabled accounts
- Invalid loan transitions
- Unavailable physical copies
- Validation failures

---

## 20. Data Integrity Requirements

The system must preserve relationships between records.

Important integrity rules include:

- A physical copy must belong to an existing book.
- A loan must reference an existing member.
- A loan must reference an existing physical copy.
- A disabled member cannot receive a new loan.
- A disabled book cannot receive a new loan.
- A disabled physical copy cannot receive a new loan.
- A physical copy cannot have more than one active loan.
- A Member can view only their own loans.
- Historical loans must not be deleted.
- Audit records must preserve the history of important actions.
- Loan creation and return processing must be atomic transactions.

---

## 21. Features Excluded from the First Version

The following features are not included in the initial version:

- Waiting lists
- Fines
- Overdue fees
- Payment processing
- Email notifications
- SMS notifications
- Push notifications
- Automatic reminders
- External notification services
- Member access to audit logs
- Librarian access to audit logs
- Physical deletion of important records
- Public registration as Admin or Librarian

These features may be considered in future versions.

---

## 22. Future Features

Possible future extensions include:

- Waiting lists
- Notifications
- Email reminders
- SMS reminders
- Push notifications
- Fine management
- Payment tracking
- Barcode scanning
- Advanced reporting
- Exporting reports
- Reservation management
- Multiple library branches
- Additional user roles
- Mobile application support

Future features must not weaken the existing authorization, data-integrity, or audit requirements.

---

## 23. Core Terminology

The system must use the following terminology consistently:

| Term | Meaning |
| --- | --- |
| Book | General bibliographic record representing a title |
| Book Copy | A specific physical copy of a book |
| User | An authenticated system account |
| Member | A person who can borrow library books |
| Loan | A record connecting a Member to a physical Book Copy |
| Request Return | Action performed by a Member |
| Confirm Return | Action performed by an Admin or Librarian |
| Disable | Deactivate a record without deleting it |
| Reactivate | Restore a disabled record |
| Overdue | A loan past its due date and not yet returned |
| Audit Log | Append-only record of important system actions |

---

## 24. Minimum Acceptance Criteria

The first version is considered functionally complete when:

1. Users can log in securely.
2. Public registration creates Member accounts only.
3. Admin, Librarian, and Member permissions are enforced.
4. Members can view only their own loan data.
5. Books can have multiple physical copies.
6. Only available physical copies can be loaned.
7. Admins and Librarians can create loans.
8. Members can request returns.
9. Admins and Librarians can confirm physical returns.
10. Overdue loans are displayed without fines or fees.
11. Disabled books and members cannot receive new loans.
12. Admins can disable and reactivate books.
13. Admins can edit, disable, and reactivate members.
14. Librarians cannot disable books.
15. Librarians cannot edit or disable members.
16. Librarians cannot view audit logs.
17. Audit records are created for important actions.
18. Historical records are preserved.
19. The interface is Hebrew and RTL.
20. The application works locally on the target computer.
21. Unauthorized backend requests are rejected.

---

## 25. Development Stages

Development is organized into five phases. Each phase builds on the previous one and must not weaken the authorization, data-integrity, or audit requirements defined above.

Progress legend:

| Mark | Meaning |
| --- | --- |
| `[x]` | Completed |
| `[~]` | In progress |
| `[ ]` | Not started |

### 25.1 Phase 1: Requirements and Infrastructure

- `[x]` **Define the System Requirements** — Define the user roles, permissions, pages, workflows, and business rules.
- `[x]` **Define User Roles** — Define the differences between the Admin, Librarian, and Member roles.
- `[x]` **Create the Repository** — Create a Git repository and establish a monorepo structure containing the Frontend, Backend, and shared packages.
- `[ ]` **Configure the Development Environment** — Install and configure Node.js, TypeScript, a package manager, ESLint, Prettier, and the required development tools.
- `[ ]` **Define the Project Structure** — Create organized folders for components, pages, routes, services, controllers, middleware, utilities, and shared types.
- `[ ]` **Set Up the Local Database** — Install PostgreSQL locally and create a dedicated database for the system.
- `[ ]` **Configure Prisma** — Connect Prisma to PostgreSQL, create the database schema, run the initial migration, and add basic seed data.
- `[ ]` **Design the Data Models** — Define models for users, members, books, loans, return requests, and audit logs.
- `[ ]` **Create the Backend Server** — Build the Node.js and Express server with routing, error handling, and logging.
- `[ ]` **Document the API** — Add Swagger or OpenAPI documentation for the backend API endpoints.

### 25.2 Phase 2: Frontend and Authentication

- `[ ]` **Create the Frontend Application** — Set up a React application using Vite and TypeScript.
- `[ ]` **Define the Design System** — Configure the visual theme using an ivory background, deep navy, forest green, and muted gold.
- `[ ]` **Configure RTL Support** — Configure the entire application for right-to-left Hebrew layout and adapt Material UI to RTL.
- `[ ]` **Configure Typography** — Add the Heebo font and define the required font sizes, weights, spacing, and text styles.
- `[ ]` **Build the Application Layout** — Create the header, navigation menu, content area, breadcrumbs, notifications, and responsive layout.
- `[ ]` **Implement Registration and Login** — Create the Login, Register, Forgot Password, and Reset Password pages.
- `[ ]` **Implement User Authentication** — Add session or token management, logout functionality, and protected routes for authenticated users.
- `[ ]` **Implement Backend Authorization** — Create middleware that verifies the user's identity and role for every protected request.
- `[ ]` **Implement Frontend Authorization** — Display menus, buttons, and actions according to the current user's permissions.
- `[ ]` **Create Error Pages** — Build the 403 Unauthorized page and the 404 Not Found page.

### 25.3 Phase 3: Users, Members, and Books

- `[ ]` **Create the User and Member Foundation** — Keep User records separate from Member records. Users handle authentication and authorization, while Members contain borrowing and personal information.
- `[ ]` **Build the Profile Page** — Display personal information, account settings, security options, and notification preferences.
- `[ ]` **Implement the Books API** — Add book creation, reading, updating, searching, filtering, and sorting functionality.
- `[ ]` **Build the Books Catalog** — Create a Hebrew catalog page with search, filters, sorting, book cards, availability indicators, and pagination.
- `[ ]` **Build the Book Details Page** — Display the book title, author, category, availability, publication information, and other relevant details.
- `[ ]` **Add Book Validation** — Use Zod to validate the title, author, ISBN, category, publication year, language, and other book fields.
- `[ ]` **Implement Book Disable and Reactivation** — Add Disable and Reactivate functionality according to the user's role. Do not physically delete book records.
- `[ ]` **Implement the Members API** — Add member listing, searching, creation, editing, details, and disabling functionality.
- `[ ]` **Build the Member Management Pages** — Create the member list, member details, create member, and edit member pages.
- `[ ]` **Enforce Member Business Rules** — Prevent disabled members from receiving new loans and restrict members to viewing only their own profile and loan history.

### 25.4 Phase 4: Loans, Dashboards, and Auditing

- `[ ]` **Implement Loan Creation** — Create a database transaction that verifies that the book and member are active and that the book does not already have an active loan.
- `[ ]` **Implement Book Returns** — Add a workflow in which a Librarian or Admin confirms and processes the physical return of a book.
- `[ ]` **Implement Return Requests** — Allow Members to submit return requests without giving them permission to confirm or process the return.
- `[ ]` **Define Loan Statuses** — Implement the following statuses:

  ```text
  ACTIVE
  RETURN_REQUESTED
  RETURNED
  OVERDUE
  CANCELLED
  ```

- `[ ]` **Build the Loan Pages** — Create loan lists, search and filtering, loan details, loan creation, return requests, and return processing pages.
- `[ ]` **Build Role-Based Dashboards** — Display information appropriate to each role:
  - **Member:** Personal loans, upcoming return dates, and personal activity.
  - **Librarian:** Active loans, overdue loans, pending return requests, and operational statistics.
  - **Admin:** Complete system statistics and administrative information.
- `[ ]` **Implement the Audit Log** — Record important actions such as login, book changes, member management, loan creation, return processing, return requests, and user management.
- `[ ]` **Make the Audit Log Append-Only** — Store audit records so they cannot be edited or deleted through the application.

### 25.5 Phase 5: Testing and Local Execution

- `[ ]` **Write Tests and Perform QA** — Add unit tests, API tests, and end-to-end tests using Playwright. Test authorization, RTL layout, accessibility, database transactions, and all core business rules.
- `[ ]` **Prepare the Local Environment and Documentation** — Create instructions for running PostgreSQL, the Backend, and the Frontend locally. Add an `.env.example` file, seed data, local database reset scripts, local backup instructions, and complete documentation in the README.

### 25.6 Recommended Local Setup

| Component | Purpose |
| --- | --- |
| PostgreSQL | Local database |
| Backend | Local Node.js and Express API server |
| Frontend | Local React application |
| Prisma Studio | Tool for viewing and managing the database during development |
| Git | Version control and source-code backup |
| README | Installation, configuration, execution, testing, and database reset instructions |

### 25.7 Current Status

**Completed:** The requirements stage. The system requirements, user roles, permissions, workflows, and business rules are defined in sections 1–24 of this document.

**Next up:** The remaining Phase 1 infrastructure work — establishing the monorepo structure, configuring the development environment and project structure, setting up PostgreSQL with Prisma, and building the backend server.
