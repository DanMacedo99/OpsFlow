# OpsFlow

A modular business operations platform focused on supplier risk, compliance monitoring, assessments and operational workflows.

The first OpsFlow module is a **Supplier Risk and Compliance Dashboard**, built to demonstrate how frontend engineering can support real business processes through typed data models, reusable components and accessible interfaces.

## Current Features

- Supplier risk and compliance dashboard
- Risk overview metric cards
- Typed supplier data model
- Supplier table with:
  - Risk level
  - Assessment status
  - Compliance score
  - Last assessment date
- Supplier details panel
- Local supplier creation
- Supplier deletion with confirmation
- Reusable React components
- Adaptive CSS Grid layouts
- Semantic HTML and keyboard focus states

## Current Project Status

OpsFlow is currently in active frontend development.

Supplier records are stored temporarily in React state and initialised from mock data. Creating or deleting a supplier does not persist after refreshing the page.

A backend API and PostgreSQL persistence will be added in a later development stage.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- CSS
- HTML5 semantic elements

### Development Quality

- ESLint
- TypeScript static type checking
- Production build validation
- Git and GitHub
- Component-based architecture

## Project Structure

```text
src/
├── components/
│   ├── dashboard/
│   │   ├── AddSupplierForm.tsx
│   │   ├── MetricCard.tsx
│   │   ├── SupplierDetailsPanel.tsx
│   │   └── SupplierTable.tsx
│   └── layout/
│       ├── PageHeader.tsx
│       └── Sidebar.tsx
├── data/
│   └── suppliers.ts
├── pages/
│   └── DashboardPage.tsx
├── types/
│   └── supplier.ts
├── App.tsx
└── main.tsx
```

## Getting Started

### Requirements

- Node.js
- npm
- Git

### Installation

Clone the repository:

```bash
git clone git@github.com:DanMacedo99/OpsFlow.git
```

Enter the project:

```bash
cd OpsFlow
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local address shown by Vite in the terminal.

## Available Scripts

```bash
npm run dev
```

Starts the Vite development server with Hot Module Replacement.

```bash
npm run lint
```

Analyses the project using ESLint.

```bash
npm run build
```

Runs TypeScript validation and creates the production build.

```bash
npm run preview
```

Serves the production build locally for verification.

## Data Model

Supplier records currently include:

```ts
type Supplier = {
  id: string
  name: string
  category: string
  country: string
  riskLevel: 'unassessed' | 'low' | 'medium' | 'high'
  assessmentStatus: 'approved' | 'pending' | 'review-required'
  complianceScore: number
  lastAssessmentDate: string | null
}
```

The TypeScript model prevents invalid risk levels, missing required properties and inconsistent supplier data during development.

## Planned Development

### Frontend

- Dynamic dashboard metrics
- Supplier search, filters and sorting
- Supplier editing
- Form validation and user feedback
- Additional pages and functional navigation
- Loading, error and empty states
- Responsive mobile navigation
- Accessibility improvements

### Backend and Data

- Node.js and Express REST API
- PostgreSQL persistence
- Runtime validation
- Structured error handling
- Database migrations
- Health checks and application logging

### Security and Workflows

- Authentication
- Role-Based Access Control
- Supplier assessments
- Approval workflows
- Compliance document tracking
- Audit logs

### Engineering Quality

- Automated tests with Vitest and React Testing Library
- API and business-rule testing
- GitHub Actions CI/CD
- Deployment configuration
- Production environment variables

## Long-Term Vision

OpsFlow is designed as a reusable operational platform that can later be adapted to different business domains, including:

- Supplier risk and compliance
- Engineering operations
- Financial operations
- Healthcare workflows
- AI and document processing

The underlying architecture will remain reusable while the data models, workflows and interfaces change according to each industry.