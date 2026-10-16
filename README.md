# OpsFlow

OpsFlow is a modular business operations platform for supplier risk, compliance monitoring, assessments and operational workflows.

Its first module combines a typed React interface, a layered REST API, PostgreSQL, session authentication, role-based permissions, organisation-level data isolation and real-time updates using Socket.IO.

## Current Status

Supplier workflows, risk assessments, authentication, role-based access control, user management and audit logging are implemented.

Automated testing covers frontend components and workflows, backend business rules, services, APIs, authentication, authorisation and organisation-level data isolation. ESLint, TypeScript validation, automated accessibility checks and a manual keyboard/screen-reader review are in place.

**Phase 6 — WebSockets and real-time updates is complete at the current project scope.** Supplier changes, assessment creation and updates, and dashboard risk metrics are synchronised without manual refresh. In-app toast notifications and automatic connection recovery are implemented.

OpsFlow remains under active development and is **not yet production-ready**. Document processing, AI/RAG integrations, deployment and production infrastructure are planned for subsequent phases.

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

### Real-Time Updates and Notifications

- Socket.IO connections over the existing HTTP server, authenticated using the application's session.
- Organisation-scoped Socket.IO rooms to isolate real-time events between tenants.
- Immediate supplier table updates for creation, editing and deletion.
- Automatic appearance of newly created assessments and updates to existing assessments, including document status and final decisions.
- Dashboard metrics refreshed as supplier risk projections change.
- Top-of-screen, automatically dismissing toast notifications for assessment events.
- Explicit reconnection settings and REST resynchronisation of Suppliers, Dashboard and Assessments after reconnection.
- ID-based duplicate prevention for created entities; idempotent replacements/removals for update/delete events; listener cleanup on component unmount.

Real-time notifications are currently transient. Events missed while a client is offline are **not replayed as notifications**; after reconnection, REST requests restore the latest data state instead.

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
| React Router, CSS, semantic HTML | PostgreSQL, `pg`, `node-pg-migrate` |
| `socket.io-client` | `socket.io` |
| Vitest, React Testing Library | Vitest, Supertest |
| jsdom, jest-dom, user-event, axe | Zod, Argon2 |
| ESLint | `express-session`, `connect-pg-simple` |

Engineering practices include parameterised SQL, database migrations, transactions, centralised error handling, environment-based configuration, a layered backend architecture, TypeScript validation and targeted automated tests.

## Architecture

REST requests pass through route middleware, controllers, services and repositories before reaching PostgreSQL.

- **Routes:** endpoints and authentication, authorisation and validation middleware.
- **Controllers:** translate requests and service results into HTTP responses; emit relevant real-time events after successful mutations.
- **Services:** business rules, workflow decisions and transactional audit recording.
- **Repositories:** database queries and supplier projections.
- **Schemas:** validate external input with Zod.
- **Migrations:** version the database structure.
- **Real-time layer:** Socket.IO shares the HTTP server with Express, uses session authentication and places clients in organisation-scoped rooms.

```text
opsflow/
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |   `-- notifications/
|   |   |       |-- RealtimeNotifications.tsx
|   |   |       `-- RealtimeNotifications.css
|   |   |-- context/
|   |   |-- hooks/
|   |   |   `-- useRealtimeConnection.ts
|   |   |-- pages/
|   |   |-- realtime/
|   |   |   `-- socket.ts
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
|   |   |-- realtime/
|   |   |   `-- socket.ts
|   |   |-- app.ts
|   |   `-- server.ts
|   `-- package.json
|-- package.json
`-- README.md
```

The main data relationships are organisations to users and suppliers, and suppliers to assessments and criterion responses. Sessions hold the authenticated user, organisation and role. Audit logs record operational changes.

The browser cookie holds the signed session identifier rather than passwords or full user data.

### Risk Data and Dashboard Projection

`risk_assessments` is the source of truth for risk and compliance results. `findAllSuppliers()` and `findSupplierById()` currently use a `LEFT JOIN LATERAL` to project the latest assessment into each supplier's returned `riskLevel`, `assessmentStatus`, `complianceScore` and `lastAssessmentDate`.

The Dashboard consumes these supplier projections. Following assessment creation, document-status changes or finalisation, the backend retrieves the updated supplier projection and emits `supplier:updated`; the frontend then recalculates the relevant metrics.

The current projection uses the **latest assessment, including pending assessments**. Separating pending assessments from the last finalised risk is a planned future business-rule refinement.

### Real-Time Event Flow

```text
Authenticated REST mutation
        |
        v
Service and PostgreSQL transaction
        |
        v
Successful commit
        |
        v
Controller emits to organisation room
        |
        +--> supplier:created / supplier:updated / supplier:deleted
        |       `--> supplier table and dashboard
        |
        `--> assessment:created / assessment:updated
                `--> assessment list and in-app toast
```

The application uses these events:

| Event | Payload | Consumer |
| --- | --- | --- |
| `supplier:created` | Supplier object | Supplier table |
| `supplier:updated` | Supplier object | Supplier table and Dashboard |
| `supplier:deleted` | Supplier ID | Supplier table |
| `assessment:created` | RiskAssessment object | Assessments page and toast notifications |
| `assessment:updated` | RiskAssessment object | Assessments page and toast notifications |

Assessment operations may emit both an assessment event and a `supplier:updated` event because changing an assessment can affect the supplier's projected risk state.

Socket.IO automatically attempts to reconnect after interruptions. After a successful reconnection, the active data pages refetch their relevant REST resources to recover changes missed while disconnected. Socket.IO is not used as a durable event history.

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

Configure `VITE_API_URL=http://localhost:3000` in `frontend/.env`. Keep the frontend origin consistent with the backend's `CORS_ORIGIN`. The Socket.IO client uses this API URL and sends the session cookie with its connection.

Do not commit real environment files.

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
- API and Socket.IO: http://localhost:3000

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

The test suite focuses on important business rules and workflows rather than artificial coverage targets. Real-time event delivery, cross-tab updates, toast display and reconnection/resynchronisation have also been **manually verified**; dedicated automated tests for those behaviours are not yet documented.

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

### Implemented — Phases 1–6

- Supplier dashboard, responsive interface and CRUD workflows.
- PostgreSQL persistence, migrations and transactional operations.
- Assessment scoring, decisions, document status and review dates.
- Authentication, session restoration and organisation isolation.
- Role permissions, role-aware frontend navigation and administrator user management.
- Audit logs with actor tracking.
- Frontend and backend automated tests, ESLint and TypeScript validation.
- Automated accessibility checks and manual keyboard/screen-reader review.
- **Phase 6: Real-time updates**
  - Authenticated Socket.IO connections and organisation-scoped rooms.
  - Real-time supplier creation, editing and deletion.
  - Assessment creation, document-status and decision updates.
  - Dashboard risk metrics updated through supplier projections.
  - Global transient toast notifications for assessment events.
  - Automatic reconnection and REST state resynchronisation.
  - ID-based duplicate prevention and listener cleanup.

### Next — Phase 7: Python, Documents, AI and RAG

- Python-based document processing.
- Compliance document upload and text extraction.
- AI-assisted document analysis and risk insights.
- Embeddings and semantic search.
- RAG with source references and human review.

### Planned — Phase 8: Deployment and Production Readiness

- Docker and Docker Compose.
- CI/CD with GitHub Actions.
- Deployment, logging, monitoring and health checks.
- Production environment and secret management.

### Future Improvements

- **Risk projection:** display the latest finalised risk as the official supplier risk while separately indicating newer pending assessments.
- **Data model cleanup:** evaluate removal of redundant risk-related columns from the physical `suppliers` table and corresponding write operations; retain the supplier DTO projection derived from `risk_assessments`.
- **Unified feedback:** migrate existing in-page success and error messages to a reusable toast system where appropriate, while retaining persistent errors when needed.
- **Offline notifications:** persist and recover relevant events/notifications missed during disconnection, with deduplication on replay. The current reconnection flow restores data, not notification history.

## Long-Term Vision

OpsFlow is intended to support reusable operational workflows across supplier compliance, engineering operations, financial operations and document processing, with domain-specific data models and business rules.
