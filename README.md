# OpsFlow

OpsFlow is a modular business operations platform for supplier risk, compliance monitoring, assessments and operational workflows.

Its first module combines a typed React interface, a layered REST API and PostgreSQL with session authentication, role-based permissions and organisation-level data isolation.

## Current Status

Supplier workflows, risk assessments, authentication, role-based access control, user management and audit logging are implemented. Frontend automated tests are in place; backend automated testing is the next milestone.

OpsFlow is under active development and is not yet production-ready.

## Features

### Suppliers and Assessments

- Supplier dashboard with dynamic metrics.
- Supplier creation, listing, details, editing and deletion.
- Search, risk filtering and table sorting.
- Loading, error, retry and empty states.
- Responsive layouts and accessible interaction patterns.
- Weighted assessment criteria and automatic compliance/risk scoring.
- Pending, approved and rejected assessment decisions.
- Compliance document status tracking.
- Review dates based on risk level and supplier risk history.
- Transactional assessment creation with criterion responses.

### Authentication and Tenant Isolation

- Organisation registration with an initial administrator.
- Login, logout and current-session lookup.
- Frontend login and registration screens.
- Argon2id password hashing.
- PostgreSQL-backed sessions and signed, HttpOnly cookies.
- Protected frontend routes and authenticated API routes.
- Organisation context taken from the server-side session.
- Supplier queries scoped by organisation; assessments scoped through their supplier.
- Cross-organisation access returns 404 without exposing another tenant's records.
- Runtime environment/input validation and centralised error responses.

### Permissions, Users and Audit Logs

Roles: `admin`, `risk_manager`, `reviewer` and `viewer`.

| Operation | Allowed Roles |
| --- | --- |
| View suppliers, assessments and risk history | All roles |
| Create/edit suppliers | Admin, risk manager |
| Delete suppliers | Admin |
| Create assessments / update document status | Admin, risk manager |
| Approve/reject assessments | Admin, reviewer |
| Manage users and roles | Admin |
| View audit logs | Admin |

The frontend adapts navigation and protected routes to the user's role. The API independently enforces permissions.

Administrators can list/create organisation users and update their roles. Audit logs record actors and changes for supplier, assessment and user operations, with an admin-only interface and filtered API access.

## Tech Stack

| Frontend | Backend |
| --- | --- |
| React, TypeScript, Vite | Node.js, Express, TypeScript |
| React Router, CSS, semantic HTML | PostgreSQL, pg, node-pg-migrate |
| Vitest, React Testing Library | Zod, Argon2 |
| jsdom, jest-dom, user-event | express-session, connect-pg-simple |

Engineering practices include parameterised SQL, database migrations, transactions, centralised error handling, environment-based configuration and a layered backend architecture.

## Architecture

Requests pass through route middleware, controllers, services and repositories before reaching PostgreSQL.

- Routes define endpoints and authentication, authorisation and validation middleware.
- Controllers translate requests and service results into HTTP responses.
- Services contain business rules, workflow decisions and transactional audit recording.
- Repositories execute database queries.
- Schemas validate external input with Zod.
- Migrations version the database structure.

```text
opsflow/
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- hooks/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- test/
|   |   |-- types/
|   |   |-- utils/
|   |   `-- App.tsx
|   |-- package.json
|   `-- vite.config.ts
|-- backend/
|   |-- migrations/
|   |-- src/
|   |   |-- config/
|   |   |-- database/
|   |   |-- errors/
|   |   |-- middlewares/
|   |   |-- modules/
|   |   |   |-- auth/
|   |   |   |-- users/
|   |   |   |-- audit-logs/
|   |   |   |-- suppliers/
|   |   |   `-- risk-assessments/
|   |   |-- app.ts
|   |   `-- server.ts
|   `-- package.json
|-- package.json
`-- README.md
```

The main data relationships are organisations to users and suppliers, and suppliers to assessments and criterion responses. Sessions hold the authenticated user, organisation and role. Audit logs record operational changes.

The browser cookie holds the signed session identifier rather than passwords or full user data.

## API Endpoints

### Health and Authentication

```text
GET   /health
POST  /auth/register
POST  /auth/login
POST  /auth/logout
GET   /auth/me
```

### Suppliers and Assessments

These routes require authentication and the permissions listed above.

```text
GET    /suppliers
GET    /suppliers/:id
POST   /suppliers
PUT    /suppliers/:id
DELETE /suppliers/:id

GET    /suppliers/:supplierId/assessments
GET    /suppliers/:supplierId/assessments/risk-history
POST   /suppliers/:supplierId/assessments
PATCH  /suppliers/:supplierId/assessments/:assessmentId/decision
PATCH  /suppliers/:supplierId/assessments/:assessmentId/document-status
```

### Administration

These routes require an authenticated administrator.

```text
GET    /users
POST   /users
PATCH  /users/:id/role
GET    /audit-logs
```

## Getting Started

Requirements: Node.js and npm compatible with the installed packages, PostgreSQL and Git.

### 1. Clone and Install

```sh
git clone git@github.com:DanMacedo99/OpsFlow.git
cd OpsFlow
npm install
npm --prefix frontend install
npm --prefix backend install
```

### 2. Configure the Environment

Create `backend/.env` from `backend/.env.example`. Set the PostgreSQL connection values, `DATABASE_URL`, `CORS_ORIGIN` and `SESSION_SECRET`.

Generate a session secret:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Configure `VITE_API_URL=http://localhost:3000` in `frontend/.env`. Keep the frontend origin consistent with the backend's `CORS_ORIGIN`. Do not commit real environment files.

### 3. Run Migrations

From `backend/`:

```sh
npm run migrate:up
```

### 4. Start the Application

From the repository root, start both applications:

```sh
npm run dev
```

Alternatively, use `npm run dev:frontend` and `npm run dev:backend` in separate terminals.

Default addresses:

- Frontend: http://localhost:5173
- API: http://localhost:3000

Register an organisation through the frontend to create its initial administrator.

## Automated Tests

Frontend tests use Vitest, React Testing Library, jest-dom, user-event and jsdom.

Current tests cover:

- Session loading, errors, retry and protected-route redirects.
- Role-based route access and sidebar navigation.
- Supplier forms, filters, sorting and empty table states.
- Supplier-page creation, editing, deletion, loading and request retry.
- Risk-assessment form submission and cancellation.
- Page-header actions.

Supplier-page tests mock service calls; they do not exercise the live API or database.

From `frontend/`, run tests in watch mode:

```sh
npm test
```

Run all discovered frontend tests once:

```sh
npm test -- --run
```

Watch mode can rerun tests affected by changed files. The one-off command runs the entire frontend suite together.

Backend tests are not configured yet. The first planned unit tests target assessment scoring and review-date calculation, followed by service workflows, API behaviour, permissions and tenant isolation.

## Validation Commands

Frontend:

```sh
npm --prefix frontend run lint
npm --prefix frontend run build
npm --prefix frontend test -- --run
```

Backend:

```sh
npm --prefix backend run typecheck
npm --prefix backend run build
```

## Roadmap

Implemented:

- Supplier dashboard and CRUD workflows.
- PostgreSQL persistence, migrations and transactional operations.
- Assessment scoring, decisions, document status and review dates.
- Authentication, session restoration and organisation isolation.
- API role permissions and role-aware frontend navigation.
- Administrator user management.
- Audit logs with actor tracking.
- Initial frontend automated test suite.

Next:

- Backend unit tests for business rules and service workflows.
- API integration tests, authentication/authorisation tests and tenant-isolation tests.
- Additional frontend workflow coverage.
- CI/CD with GitHub Actions.
- Docker, deployment configuration, production logging and monitoring.

Longer term:

- Compliance document upload and processing.
- Real-time updates.
- Python-based document analysis.
- AI-assisted risk insights and retrieval-augmented generation.

## Long-Term Vision

OpsFlow is intended to support reusable operational workflows across supplier compliance, engineering operations, financial operations and document processing, with domain-specific data models and business rules.
