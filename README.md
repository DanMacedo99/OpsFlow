OpsFlow

OpsFlow is a modular business operations platform for supplier risk, compliance monitoring, assessments and operational workflows.

Its first module is a multi-tenant Supplier Risk and Compliance Platform. It demonstrates how a typed React interface, a layered REST API and PostgreSQL can support real business processes while keeping each organisation's data isolated.

Current Features

Supplier management

Supplier dashboard with dynamic metrics

Supplier creation, listing, details, editing and deletion

Search, filtering and table sorting

Risk level, assessment status and compliance score tracking

Loading, error, retry and empty states

Responsive layouts and accessible keyboard navigation

Risk assessments

Weighted assessment criteria

Automatic risk and compliance score calculation

Risk levels derived from assessment results

Pending, approved and rejected decisions

Compliance document status tracking

Review-date calculation based on risk level

Supplier risk history

Transactional creation of assessments and their responses

Authentication and security

Organisation and administrator registration

Password hashing with Argon2id

Login and logout endpoints

Server-side sessions stored in PostgreSQL

Signed, HttpOnly session cookies

Protected supplier and assessment routes

Standardised application errors and safe HTTP responses

Duplicate registration handling with 409 Conflict

Environment validation with Zod

Multi-tenancy

Users belong to an organisation

Suppliers belong to an organisation

The organisation ID is obtained from the authenticated session, never from the request body

Supplier queries are scoped by organisation

Risk assessments are scoped through their parent supplier

Cross-organisation access returns 404 Not Found without exposing another tenant's data

Current Project Status

The frontend dashboard, supplier REST API, PostgreSQL persistence, risk-assessment workflow, session authentication and organisation-level data isolation are implemented.

The following access roles are defined:

admin

risk_manager

reviewer

viewer

The first registered user of an organisation receives the admin role. Role-based permissions for individual operations are the next security milestone.

OpsFlow is under active development and is not yet production-ready. Automated testing, audit logs, actor tracking, CI/CD and deployment configuration remain planned.

Tech Stack

Frontend

React

TypeScript

Vite

React Router

CSS

Semantic HTML5

Backend

Node.js

Express

TypeScript

Zod

PostgreSQL

pg

node-pg-migrate

Argon2

express-session

connect-pg-simple

Engineering practices

Layered backend architecture

Runtime and static type validation

Parameterised SQL queries

Database migrations

PostgreSQL transactions

Centralised error handling

Environment-based configuration

ESLint and production build validation

Git and GitHub

Accessible interaction patterns

Architecture

Backend requests follow this flow:

Route
  -> validation middleware
  -> authentication middleware
  -> controller
  -> service
  -> repository
  -> PostgreSQL

Each layer has a focused responsibility:

Routes define endpoints and middleware order.

Controllers receive HTTP requests and create HTTP responses.

Services contain business rules and workflow decisions.

Repositories execute parameterised PostgreSQL queries.

Schemas validate external input at runtime with Zod.

Migrations version database structure changes.

Middlewares handle authentication, validation and errors.

Project Structure

opsflow/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── dashboard/
│   │   │   └── layout/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── migrations/
│   ├── request/
│   ├── src/
│   │   ├── config/
│   │   ├── errors/
│   │   ├── middlewares/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── suppliers/
│   │   │   └── risk-assessments/
│   │   ├── types/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
└── README.md

Data Model

The main PostgreSQL relationships are:

organisations
  -> users
  -> suppliers
       -> risk_assessments
            -> risk_assessment_responses

sessions
  -> authenticated user and organisation context

The session stores the authenticated user's ID, organisation ID and role. The browser cookie stores only the signed session identifier; passwords and full user data are not stored in the cookie or in localStorage.

API Endpoints

Health

GET /health

Authentication

POST /auth/register
POST /auth/login
POST /auth/logout

Suppliers

These routes require an authenticated session:

GET    /suppliers
GET    /suppliers/:id
POST   /suppliers
PUT    /suppliers/:id
DELETE /suppliers/:id

Risk assessments

GET   /suppliers/:supplierId/assessments
GET   /suppliers/:supplierId/assessments/risk-history
POST  /suppliers/:supplierId/assessments
PATCH /suppliers/:supplierId/assessments/:assessmentId/decision
PATCH /suppliers/:supplierId/assessments/:assessmentId/document-status

Getting Started

Requirements

Node.js

npm

PostgreSQL

Git

1. Clone the repository

git clone git@github.com:DanMacedo99/OpsFlow.git
cd OpsFlow

2. Install dependencies

cd frontend
npm install

cd ../backend
npm install

3. Configure the backend environment

Create backend/.env from backend/.env.example and provide your local PostgreSQL connection values.

Generate a secure session secret:

node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"

Place the generated value in SESSION_SECRET. Never commit the real .env file.

4. Run database migrations

From backend/:

npm run migrate:up

5. Start the backend

From backend/:

npm run dev

The API runs by default at:

http://localhost:3000

6. Start the frontend

In a second terminal, from frontend/:

npm run dev

Vite runs by default at:

http://localhost:5173

Validation Commands

Run these commands inside the relevant workspace:

npm run lint
npm run build

lint analyses code quality and ESLint rules.

build validates TypeScript and creates the production build.

Security Model

Authentication and tenant isolation solve different problems:

Authentication confirms that a session belongs to a logged-in user.

Tenant isolation restricts that user to records belonging to their organisation.

Authorisation will determine which operations are allowed for each role.

Current tenant-sensitive operations use the organisation ID stored in the server-side session. Client-provided organisation IDs are not trusted.

Roadmap

Completed

Frontend dashboard and supplier workflows

Express REST API

PostgreSQL persistence and migrations

Supplier CRUD

Risk-assessment scoring and lifecycle

Registration, login and logout

Argon2id password protection

PostgreSQL-backed sessions

Protected routes

Users linked to organisations

Supplier and assessment isolation by organisation

Base access roles

Next

Role-Based Access Control permissions per operation

Audit logs

Record who created, edited, assessed or deleted information

Automated frontend and backend tests

API and business-rule integration tests

Frontend authentication screens and role-aware UI

CI/CD with GitHub Actions

Docker and deployment configuration

Production logging and monitoring

Longer term

Real-time updates with WebSockets

Compliance document upload and processing

Python-based document analysis

AI-assisted risk insights and RAG

Long-Term Vision

OpsFlow is designed as a reusable operational platform that can be adapted to different domains, including:

supplier risk and compliance;

engineering operations;

financial and trading operations;

healthcare workflows;

AI and document processing.

The architecture remains reusable while data models, rules and interfaces evolve for each industry.

