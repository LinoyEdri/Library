# Library Management System - Project Handoff

Hebrew RTL library management system: React frontend, Express and Prisma backend, PostgreSQL.
Built in **"ping-pong" slices**: each slice adds a feature's backend API, then its frontend pages, on its own branch.
The full requirements spec is in `README.md` (to be moved to `docs/requirements.md` in Slice 12).

## Working agreement (must follow)

- **Git:** the user creates, switches and merges branches. Claude only **commits** on the current branch.
  - Never create, switch, push or merge branches.
  - Small focused commits, conventional messages (`feat(backend): ...`, `refactor(frontend): ...`).
- **After every branch,** send a review:
  - files added and modified, each with a one-line purpose;
  - new features and endpoints;
  - new libraries and why each was added.
- **Smoke pass:** with every finished branch, also send a manual smoke-test checklist: step-by-step checks per role (what to click, what should happen), including error cases, so the user can test the branch in the browser.
- **Token economy:** keep usage low without hurting quality.
  - Batch file writes and checks.
  - Don't re-read files you just wrote.
  - Avoid subagents unless needed.
  - Keep replies concise.

## Code standards

- **File organization:**
  - Many small, focused files.
  - Long meaningful names (`authorize-permission.middleware.ts`, `useVisibleNavigationItems.ts`).
  - Blank lines between logical blocks.
  - Short, simple comments.
- **React:**
  - Every component's logic (state, effects, handlers, derived data) lives in its own hook, in a `hooks/` folder **next to the component** (e.g. `pages/authentication/hooks/useLoginForm.ts`). The `.tsx` file only renders.
  - App-wide hooks live in `frontend/src/hooks/`: `useAuthentication`, `useCan`, `useNotification`.
- **JSX formatting:** one prop per line, and `sx` and other object props expanded with one property per line:
  ```tsx
  <Toolbar
    sx={{
      gap: 1,
    }}
  >
  ```
  Prettier's `singleAttributePerLine: true` enforces most of this. Always write object props expanded, because Prettier keeps them that way.
- **Status codes:** never hard-code numbers; use `StatusCodes.*` from `http-status-codes`. Text conversion is in `backend/src/utils/status-text.ts`.
- **Backend types:** never declare types inline in services, middlewares or controllers. They go in `backend/src/types/<purpose>/`:
  - `requests/`: request bodies, re-exported from the shared schemas
  - `responses/`: what services return
  - `database/`: Prisma payload types and `DatabaseClient`
  - `authentication/`, `audit/`, `http/`, `errors/`
  - Files are named `*.types.ts`; response types `*.response.types.ts`.
- **Backend utils:** pure helper functions go in `backend/src/utils/<purpose>/` (`authentication/`, `http/`, `errors/`, `mappers/`, `comparison/`, `audit/`, `request/`), one function per file. Helpers that call repositories or services stay in the service.
- **Language:** all UI text and validation messages are in Hebrew (spec requirement). UI strings live in `frontend/src/constants/hebrew-texts.ts`.
- **Prettier** (root `.prettierrc`): single quotes, 2-space indent, trailing commas, 100 columns, LF line endings (`.gitattributes`).

## Stack and layout

npm workspaces monorepo, Node >= 22.18:

- `shared/` (`@library/shared`): built with tsc to `dist/`. **The other packages import the built output**, and root scripts build it first.
  - `enums/`: mirror the Prisma enums; a test guards this.
  - `schemas/`: Zod schemas for auth, address and list queries, with Hebrew messages.
  - `permissions/`: `Permission`, `ROLES_ALLOWED_BY_PERMISSION`, `hasPermission`.
  - `types/`: API envelope, `SafeUserResponse`, `LoginResponse`, `PaginationMeta`.
- `backend/`: Express 5, Prisma 7 (`@prisma/adapter-pg`), Zod 4, pino, Swagger at `/api/docs`, Vitest and Supertest.
  - Layers in `src/`: routes → middlewares → controllers (thin, `catchAsync`, always `ApiResponse.success`) → services (business rules, transactions, audit) → repositories (Prisma only).
  - Prisma config lives in `prisma7.config.ts`; the CLI picks it up automatically.
- `frontend/`: React 19, Vite (port 3000, proxies `/api` to 3001), MUI 9 with an Emotion RTL cache, React Router 8, TanStack Query, React Hook Form with zodResolver, axios.

**Key backend pieces:**

- `middlewares/auth/require-authentication.middleware.ts`: verifies the JWT, then re-loads the user from the database, so disabling a user or changing their role takes effect immediately. Sets `req.user = { id, email, role, memberId }`.
- `middlewares/auth/authorize-permission.middleware.ts`: `authorizePermission(Permission.X, ...)` returns 403.
- Route chain: `requireAuthentication → authorizePermission(...) → validate(RequestLocation.BODY, schema) → controller`.
- `services/audit-log.service.ts`: `recordAuditLogEntry(entry, transactionClient)`. Always write the audit row **in the same transaction** as the change, using `runInDatabaseTransaction` from `prisma/run-in-database-transaction.ts`. Repositories accept an optional `DatabaseClient`.
- Errors: `AppError` subclasses in `types/errors/` (Validation 400, Unauthorized 401, Forbidden 403, NotFound 404, Conflict 409, Internal 500). The global `errorMiddleware` builds the envelope.
- "Remove" always means disable: set `status`, `disabledDate` and `disabledByUserId`, plus an audit row. Never physically delete.

**Key frontend pieces:**

- `services/api-client.ts`: adds the Bearer token, unwraps the envelope (`sendApiRequest<T>`), throws `ApiRequestError`, and triggers the expired-session handler on 401.
- `context/AuthenticationProvider.tsx`: current user via TanStack Query (`/auth/me`), plus `login` and `logout`.
- `components/routing/application-router.tsx`: guest-only, logged-in and `RequirePermission` routes, with `handle.breadcrumb` for breadcrumbs.
- `constants/navigation-items.ts`: role-based side menu driven by permissions.

## Decisions made with the user

- Public sign-up creates a **VIEWER**; staff turn users into Members.
- The JWT is stored in **localStorage** and sent as a Bearer header.
- The API prefix is `/api`, not `/api/v1`.
- Login returns one generic 401 for every failure. Failed logins on known accounts are audited; unknown emails are only logged, because an audit row needs a real user.
- Admin is a superset of Librarian. Admin and Librarian manage book copies; only Admin disables or reactivates books.
- Disabling a membership turns the account into a guest (VIEWER); reactivating restores MEMBER. The person can still log in, but cannot receive new loans while disabled.
- Role and membership stay in step: changing a role to MEMBER creates or reactivates the membership; any other role disables an active one. Admins cannot change their own role or status, and the last active admin cannot be demoted or disabled.
- Member search splits the text into words; every word must match a name, the email or the phone (digits only).

## Commands

```bash
npm install                 # also builds shared (postinstall)
npm run dev                 # shared watch + backend :3001 + frontend :3000
npm run lint && npm run typecheck && npm test
npm run test:unit --prefix backend          # no database needed
npm run test:integration --prefix backend   # auto-creates/migrates library_test DB
npm run db:migrate | db:seed | db:studio    # seed needs ALLOW_DESTRUCTIVE_SEED=true
npx prettier --write .
```

- Env: `backend/.env` (template in `backend/.env.example`, validated with Zod).
- Integration tests use the separate `library_test` database. Their table cleanup refuses to run on any other database.
- Seed logins: `admin@library.local`, `librarian@library.local`, plus members `dana.cohen@example.com` and others. The password is `SEED_PASSWORD`.

## Progress

| Slice | Branch                                                                                                                 | Status                  |
| ----- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 0     | `feature/authorization-rbac`: shared package, Zod env, auth fixes, RBAC, audit foundation, test harness                | ✅ merged               |
| 1     | `feature/frontend-foundation`: theme/RTL, API client, auth context, router and guards, layout, login, sign-up, 403/404 | ✅ merged               |
| 2     | `feature/profile`: PATCH /users/me, change password, logout API, Profile page                                          | ✅ merged               |
| 3     | `feature/catalog-reference`: authors, publishers, categories API + catalog tabs and admin dialogs                      | ✅ merged               |
| 4     | `feature/books`: books + copies API, catalog grid, book details, book form, copies table                               | ✅ merged               |
| 5     | `feature/members`: members API (two create modes, candidates, own membership) + list, details, forms                   | ✅ merged               |
| 6     | `feature/users`: admin user management API (roles synced with memberships, admin safety rules) + list, details, forms  | ✅ done (merge pending) |
| 7–12  | see below                                                                                                              | ⬜                      |

## Remaining roadmap

Every slice is done when:

- backend and frontend are built;
- the shared schemas live in `@library/shared`;
- OpenAPI docs are added (`routes/docs/*.docs.ts` plus `config/openapi-component-schemas.ts`);
- unit tests and Supertest integration tests are written, covering 401/403/200 per role;
- lint, typecheck, tests, Prettier and the frontend build all pass;
- the review is sent.

List endpoints use the shared `listQuerySchema` (page, pageSize, search, sortOrder, status) and return `meta: PaginationMeta`.

**2. Profile** (`feature/profile`)

- Backend:
  - `PATCH /api/users/me`: name, phone and address. Audit `USER_UPDATED` and `ADDRESS_UPDATED`.
  - `POST /api/auth/change-password`: requires the current password. Audit `USER_PASSWORD_CHANGED`.
  - `POST /api/auth/logout`: audit `USER_LOGOUT`.
- Frontend:
  - Profile page: personal info, address, change-password card, account info (role, last login).
  - Logout calls the logout API.

**3. Authors, Categories, Publishers** (`feature/catalog-reference`)

- Backend:
  - `GET` list and `GET /:id` for all authenticated users; non-admins see only ACTIVE records.
  - `POST`, `PATCH /:id`, `POST /:id/disable` and `POST /:id/reactivate` are ADMIN only.
  - Unique-name violations return 409. Audit `*_CREATED`, `*_UPDATED`, `*_DISABLED` and `*_REACTIVATED`.
- Frontend: lists (tabs under Books for staff, browse lists for others), admin dialogs, and autocomplete sources for the book form.

**4. Books and copies** (`feature/books`)

- Backend:
  - `GET /api/books`: search (title, ISBN, author), filters (category, author, publisher, language, availability), sort, pagination, `availableCopies` and `totalCopies`.
  - `GET /:id`.
  - `POST` and `PATCH` (staff), in one transaction with the BookAuthor and BookCategory rows. Zod validates ISBN and year.
  - `POST /:id/disable` and `/reactivate` (ADMIN only).
  - Copies: `POST /api/books/:id/copies` and `PATCH /api/copies/:id/status` (lost, damaged, disabled, reactivate; rejected while ON_LOAN).
- Frontend: catalog with cards, filters, availability chips and pagination; details page; create/edit form; copies table.

**5. Members** (`feature/members`)

- Backend:
  - `GET /api/members` (staff): search and status filter.
  - `GET /:id` (staff, or the member themself).
  - `GET /members/me`.
  - `POST` in two modes: (a) `{ userId }` turns an existing VIEWER into a MEMBER and creates the Member row; (b) a new user with address. Audit `MEMBER_CREATED` and `USER_ROLE_CHANGED`.
  - `PATCH`, `disable` and `reactivate` (staff).
- Frontend: list, details (loans tab filled in Slice 8), create/edit with a "link existing user / new person" toggle.

**6. Users, admin only** (`feature/users`)

- Backend:
  - `GET` list with role and status filters; `GET /:id`.
  - `POST` with any role (MEMBER reuses the member service).
  - `PATCH /:id`.
  - `PATCH /:id/role`: changing to MEMBER creates or reactivates the Member row.
  - `disable` and `reactivate`.
  - Guards: an admin cannot disable or demote themself, and the last active admin cannot be removed.
- Frontend: list, details and forms.

**7. System settings** (`feature/settings`)

- Backend:
  - New `SystemSetting` model and migration: key (unique), value Json, description, status, updatedByUserId.
  - Seed keys: `loanPeriodDays=14`, `maxActiveLoansPerMember=5`.
  - `GET /api/settings` and `PATCH /api/settings/:key`. Audit `SYSTEM_SETTING_*`.
  - `settingsService.get(key, default)`.
- Frontend: Settings page.

**8. Loans** (`feature/loans`)

- Backend:
  - `POST /api/loans` (staff) in one transaction:
    - member and book must be ACTIVE;
    - pick an AVAILABLE copy by barcode or by book;
    - flip the copy with a guarded `updateMany` (`where status = AVAILABLE`) so it can't be loaned twice;
    - enforce the max-active-loans limit;
    - dueDate comes from the settings;
    - audit `LOAN_CREATED`.
  - `GET /api/loans`: staff can filter; a MEMBER only gets their own loans (`memberId` forced); VIEWER gets 403.
  - `GET /:id`: ownership check for members.
  - Members: `POST /:id/return-request` and `/return-request/cancel`.
  - Staff: `POST /:id/return` (copy becomes AVAILABLE, or DAMAGED/LOST) and `POST /:id/cancel`.
  - `markOverdue()` runs at startup and every hour; audit `LOAN_MARKED_OVERDUE`.
- Frontend: loans list (staff filters, pending returns tab, members see their own), details with a timeline, new-loan dialog, process-return dialog, and request/cancel return buttons.

**9. Dashboards** (`feature/dashboard`)

- Backend: `GET /api/dashboard` returns a role-specific payload.
  - Member: active loans and due dates.
  - Librarian: active, overdue, pending returns, and today's counts.
  - Admin: everything above, plus totals and recent audit entries.
- Frontend: stat cards and short tables. Viewers have no dashboard.

**10. Audit log** (`feature/audit-log`)

- Backend:
  - `GET /api/audit-logs` (ADMIN) with filters for action, entity, user, record and dates; `GET /:id`.
  - A migration adds a Postgres trigger that blocks UPDATE and DELETE on AuditLog.
  - The seed's reset switches to `TRUNCATE ... CASCADE`.
- Frontend: filterable table and a drawer comparing previous and new values.

**11. (Optional) Forgot / reset password**

- `PasswordResetToken` model; `POST /api/auth/forgot-password` (always 200; the reset link is logged in dev) and `POST /api/auth/reset-password`.
- Frontend: Forgot Password and Reset Password pages.

**12. QA and docs** (`chore/qa-docs`)

- Playwright E2E per role (seeded DB), RTL and accessibility checks (`@axe-core/playwright`), and a QA checklist.
- Rewrite README (setup, env, run, test, reset, backup) and move the spec to `docs/requirements.md`.
- Code-split routes: the frontend bundle is over 500 KB because of MUI.

## Known notes

- `bcrypt` is still a backend dependency but unused (`bcryptjs` is used). Remove it eventually.
- Prettier puts single-prop JSX elements on one line. That is expected and accepted.
- Docker on the user's machine holds port 3000; Vite uses `strictPort` so it fails loudly instead of taking 3001.
- Placeholder image services cannot render Hebrew; books without an image use the app's built-in cover.
