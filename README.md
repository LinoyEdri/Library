# Library Management System

A local library management system with a Hebrew, right-to-left interface. It manages the book catalog and physical copies, members, loans and returns, overdue tracking, role-based dashboards, system settings and an append-only audit log.

- **Frontend:** React 19, Vite, MUI 9 (RTL), React Router, TanStack Query, React Hook Form + Zod
- **Backend:** Express 5, Prisma 7, PostgreSQL, Zod, pino, Swagger
- **Shared:** `@library/shared` holds the enums, Zod schemas (with Hebrew messages), permissions and API types used by both sides
- **Tests:** Vitest + Supertest (backend), Playwright + axe (end-to-end, accessibility)

The full functional specification is in [docs/requirements.md](docs/requirements.md).

## Roles

| Role (Hebrew)      | Can                                                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| Admin (מנהל מערכת) | Everything a librarian can, plus users, roles, disabling books and catalog data, settings and the audit log |
| Librarian (ספרן)   | Books and copies, members, loans and returns, the staff dashboard                                           |
| Member (מנוי)      | Browse books, see their own loans, request returns, their dashboard and profile                             |
| Viewer (אורח)      | Browse books and edit their profile (every public sign-up starts as a viewer)                               |

"Removing" anything means disabling it: records are never physically deleted, and every change is written to the audit log.

## Project structure

```
shared/     @library/shared: enums, Zod schemas, permissions, API types (built to dist/)
backend/    Express API: routes -> middlewares -> controllers -> services -> repositories (Prisma)
  prisma/   schema.prisma, migrations, seed.ts
frontend/   React app: pages/, components/, hooks/, services/ (API calls), constants/ (Hebrew texts)
e2e/        Playwright end-to-end tests (own database and ports)
docs/       requirements.md (specification), qa-checklist.md (manual QA)
```

## Prerequisites

- Node.js 22.18 or newer (npm comes with it)
- PostgreSQL 14 or newer, running locally or in Docker

## Setup

1. **Install** (also builds the shared package):

   ```bash
   npm install
   ```

2. **Configure the backend:** copy the template and fill in your values.

   ```bash
   cp backend/.env.example backend/.env
   ```

   | Variable                                                  | Meaning                                                                                                  |
   | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
   | `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | PostgreSQL connection (the database is created by the first migration if your user may create databases) |
   | `BACKEND_PORT`                                            | API port, default `3001`                                                                                 |
   | `JWT_SECRET`, `JWT_EXPIRES_IN`                            | Login token signing key and lifetime (e.g. `1h`)                                                         |
   | `CORS_ORIGIN`                                             | The frontend address, `http://localhost:3000`                                                            |
   | `SEED_PASSWORD`                                           | Password of every seeded account                                                                         |
   | `ALLOW_DESTRUCTIVE_SEED`                                  | Must be `true` to run the seed, because it empties every table first                                     |
   | `SIMULATE_MESSAGE_DELIVERY`                               | `true`: password reset codes are shown in the app instead of sent (there is no email/SMS provider)       |

   All variables are validated at startup; a missing or invalid one stops the backend with a clear message.

3. **Create the tables and load the sample data:**

   ```bash
   npm run db:migrate
   npm run db:seed        # with ALLOW_DESTRUCTIVE_SEED=true in backend/.env
   ```

## Running

```bash
npm run dev
```

This starts the shared package in watch mode, the API on http://localhost:3001 and the app on http://localhost:3000 (Vite proxies `/api` to the backend).

- App: http://localhost:3000
- API documentation (Swagger): http://localhost:3001/api/docs

### Seeded accounts

All use the `SEED_PASSWORD` from `backend/.env`.

| Account                                                                                                     | Role      |
| ----------------------------------------------------------------------------------------------------------- | --------- |
| `admin@library.local`                                                                                       | Admin     |
| `librarian@library.local`                                                                                   | Librarian |
| `dana.cohen@example.com`, `yossi.levi@example.com`, `michal.avraham@example.com`, `uri.mizrahi@example.com` | Members   |

To get a viewer, sign up on the registration page.

### Forgotten passwords (simulated email/SMS)

"שכחת סיסמה?" on the login page sends a 6-digit code by email or SMS. No real provider is connected, so while `SIMULATE_MESSAGE_DELIVERY=true` the "received" message appears in a popup in the corner of the page. The code and the reset page each last 5 minutes. A real provider plugs into `backend/src/services/message-delivery.service.ts`.

## Tests and checks

```bash
npm run lint
npm run typecheck
npm test                                    # backend unit + integration tests
npm run test:unit --prefix backend          # unit tests only (no database needed)
npm run test:integration --prefix backend   # integration tests only
npm run test:e2e                            # Playwright end-to-end tests
npm run format:check                        # Prettier
```

- **Integration tests** use a separate database, `library_test`, created and migrated automatically. Their cleanup refuses to run on any other database.
- **End-to-end tests** use their own database, `library_e2e`. Every run creates it if needed, migrates it and loads the seed, then starts the API on port 3101 and the app on port 3100. Your development database and servers are not touched.
  - Before the first run, download the browser: `npx playwright install chromium`.
  - The suite covers login, the menus of each role, the catalog, the full loan workflow, a disabled member, password reset, and RTL plus accessibility (axe, WCAG 2 A/AA) checks.
  - After a run, `npm run report --prefix e2e` opens the HTML report.
- The manual QA checklist per role is in [docs/qa-checklist.md](docs/qa-checklist.md).

## Resetting the database

To go back to the sample data, run the seed again (it empties every table and reloads it):

```bash
npm run db:seed    # needs ALLOW_DESTRUCTIVE_SEED=true
```

To drop and rebuild the whole schema from the migrations, then load the sample data:

```bash
npm run db:reset
npm run db:seed
```

The audit log table is append-only: database triggers reject `UPDATE` and `DELETE`, and reject `INSERT` from anywhere but the application (for example Prisma Studio). Resets therefore use `TRUNCATE`, which the triggers allow.

## Backup and restore

Use the PostgreSQL tools (`pg_dump`, `pg_restore`). Replace the connection values with those in `backend/.env`.

**Back up** to a single compressed file:

```bash
pg_dump --host=localhost --port=5432 --username=postgres --format=custom --file=library-backup.dump library
```

**Restore** into the same database (existing tables are replaced):

```bash
pg_restore --host=localhost --port=5432 --username=postgres --clean --if-exists --dbname=library library-backup.dump
```

**Restore into a new database** (for example, to inspect an old backup):

```bash
createdb --host=localhost --port=5432 --username=postgres library_restored
pg_restore --host=localhost --port=5432 --username=postgres --dbname=library_restored library-backup.dump
```

**PostgreSQL in Docker:** run the same commands inside the container, and copy the file in or out:

```bash
docker exec <container> pg_dump --username=postgres --format=custom --file=/tmp/library-backup.dump library
docker cp <container>:/tmp/library-backup.dump ./library-backup.dump
```

Stop the backend before restoring, then start it again.

## Production build

```bash
npm run build      # shared, backend (to backend/dist) and frontend (to frontend/dist)
npm start          # runs the built API
```

The frontend build is split per page: each page and the large libraries (React, MUI) are separate files loaded when needed.

## Troubleshooting

- **Port 3000 is already in use** (often Docker): the frontend stops with an error instead of moving to another port. Free the port or change it in `frontend/vite.config.ts`.
- **The backend does not see a database change** after `prisma generate` or a new migration: restart `npm run dev`.
- **Type errors about `@library/shared` after pulling changes:** run `npm run build:shared` (the other packages use its built output).
- **The seed refuses to run:** set `ALLOW_DESTRUCTIVE_SEED=true` in `backend/.env`. It never runs with `NODE_ENV=production`.
