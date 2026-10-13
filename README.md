# OpsFlow

OpsFlow is a modular business operations platform for supplier risk, compliance monitoring, assessments and operational workflows.

Its first module combines a typed React interface, a layered REST API and PostgreSQL with session authentication, role-based permissions and organisation-level data isolation.

## Current Status

Supplier workflows, risk assessments, authentication, role-based access control, user management and audit logging are implemented.

Automated testing is in place across the frontend and backend, covering component and workflow behaviour, business rules, services, API behaviour, authentication, authorisation and organisation-level data isolation. ESLint, TypeScript validation and automated accessibility checks are also configured.

The current development milestone focuses on real-time updates using WebSockets.

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

| Frontend | Backend 
| --- | --- |
| React, TypeScript, Vite | Node.js, Express, TypeScript |
| React Router, CSS, semantic HTML | PostgreSQL, pg, node-pg-migrate |
| Vitest, React Testing Library | Vitest, Supertest |
| jsdom, jest-dom, user-event, axe | Zod, Argon2 |
| ESLint | express-session, connect-pg-simple |



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

Current frontend tests cover:

- Session loading, errors, retry and protected-route redirects.
- Role-based route access and sidebar navigation.
- Supplier forms, filters, searching, sorting and table behaviour.
- Supplier creation, editing and deletion workflows.
- Loading, error and retry states.
- Risk-assessment form behaviour.
- Page-header actions.
- Automated accessibility checks using axe on representative forms and pages.

Backend tests use Vitest and Supertest.

Current backend tests cover:

- Risk and compliance score calculations.
- Risk-level boundaries and validation rules.
- Review-date business rules.
- Risk-assessment service workflows.
- API responses and validation behaviour.
- Authentication and role-based authorisation middleware.
- Organisation-scoped repository queries for tenant isolation.

The test suite focuses on important business rules and workflows rather than artificial coverage targets.

From either application directory, run:

```sh
npm test -- --run
```
## Validation Commands

Frontend:

```sh
npm --prefix frontend run lint
npm --prefix frontend run build
npm --prefix frontend test -- --run
```

Backend:

```sh
npm --prefix backend run lint
npm --prefix backend run typecheck
npm --prefix backend run build
npm --prefix backend test -- --run
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
- Frontend automated component and workflow tests.
- Backend business-rule, service, API, authentication and tenant-isolation tests.
- ESLint and TypeScript validation across frontend and backend.
- Automated accessibility testing.
- Manual keyboard and screen-reader accessibility review.

Current:

- WebSocket configuration and real-time client connections.
- Real-time supplier table updates.
- Automatic assessment updates.
- Dashboard risk updates.
- Internal notifications.
- Reconnection handling and duplicate-event prevention.

Next:

- Python-based document processing.
- Compliance document upload and extraction.
- AI-assisted document analysis and risk insights.
- RAG with source references.
- Docker and Docker Compose.
- CI/CD with GitHub Actions.
- Deployment, logging, monitoring and production readiness.

Longer term:

- Compliance document upload and processing.

- Python-based document analysis.
- AI-assisted risk insights and retrieval-augmented generation.

## Long-Term Vision

OpsFlow is intended to support reusable operational workflows across supplier compliance, engineering operations, financial operations and document processing, with domain-specific data models and business rules.
