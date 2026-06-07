# VM Inventory Manager

Enterprise-grade full-stack web application for centralized virtual machine inventory, lifecycle management, governance, reporting, and audit logging across VMware, Hyper-V, AWS EC2, Azure VMs, Google Cloud Compute Engine, and manually managed infrastructure.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **State/Data:** TanStack Query, TanStack Table, React Hook Form, Zod
- **Backend:** Next.js API Routes, NextAuth.js
- **Database:** PostgreSQL, Prisma ORM
- **Charts:** Recharts
- **Testing:** Jest, React Testing Library
- **Deployment:** Docker, docker-compose

## Features

- Role-Based Access Control (Admin, Operator, Viewer)
- Enterprise dashboard with summary cards and charts
- VM inventory with server-side filtering, pagination, bulk selection, export
- VM detail pages with audit timeline
- CSV import with validation and history
- Reporting (Infrastructure, Security, Lifecycle, Business)
- User management
- Audit logging
- Global command palette search (Ctrl/Cmd+K)
- Notification center
- Dark/light mode
- Responsive design

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or Docker)

### Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start PostgreSQL (Docker)
docker compose up postgres -d

# Push schema and seed data
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Docker (Full Stack)

```bash
docker compose up -d postgres
docker compose run migrate
docker compose up -d app
```

## Default Credentials

| Role     | Email                      | Password       |
|----------|----------------------------|----------------|
| Admin    | admin@vminventory.local    | Password123!   |
| Operator | operator@vminventory.local | Password123! |
| Viewer   | viewer@vminventory.local   | Password123!   |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/               # REST API endpoints
│   ├── dashboard/         # Dashboard page
│   ├── vms/               # VM inventory pages
│   ├── reports/           # Reporting module
│   ├── imports/           # CSV import module
│   ├── users/             # User management
│   └── ...
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui primitives
├── lib/                   # Utilities, auth, RBAC, validations
├── hooks/                 # Custom React hooks
└── __tests__/            # Unit & component tests
prisma/
├── schema.prisma         # Database schema
└── seed.ts               # Seed script (100 VMs, 3 users)
```

## API Endpoints

| Method | Endpoint           | Description              |
|--------|--------------------|--------------------------|
| GET    | /api/dashboard     | Dashboard analytics      |
| GET    | /api/vms           | List VMs (paginated)     |
| POST   | /api/vms           | Create VM                |
| GET    | /api/vms/:id       | Get VM details           |
| PUT    | /api/vms/:id       | Update VM                |
| DELETE | /api/vms/:id       | Delete VM                |
| POST   | /api/import        | Import CSV               |
| GET    | /api/imports       | Import history           |
| GET    | /api/reports       | Generate reports         |
| GET    | /api/users         | List users               |
| POST   | /api/users         | Create user              |
| PUT    | /api/users/:id     | Update user              |
| DELETE | /api/users/:id     | Disable user             |
| GET    | /api/audit-logs    | Audit log entries        |
| GET    | /api/notifications | User notifications       |
| GET    | /api/search        | Global search            |

## RBAC Permissions

| Permission        | Admin | Operator | Viewer |
|-------------------|-------|----------|--------|
| View VMs          | ✓     | ✓        | ✓      |
| Create/Edit VMs   | ✓     | ✓        | ✗      |
| Delete VMs        | ✓     | ✗        | ✗      |
| Import CSV        | ✓     | ✓        | ✗      |
| View Reports      | ✓     | ✓        | ✓      |
| Export Data       | ✓     | ✓        | ✓      |
| Manage Users      | ✓     | ✗        | ✗      |
| View Audit Logs   | ✓     | ✗        | ✗      |

## Testing

```bash
npm test
npm run test:coverage
```

## Security

- bcrypt password hashing (12 rounds)
- JWT session management via NextAuth
- Zod input validation on all endpoints
- Prisma ORM (SQL injection protection)
- Rate limiting on API routes
- Secure HTTP headers
- RBAC middleware enforcement
- Comprehensive audit logging

## Environment Variables

| Variable          | Description                    |
|-------------------|--------------------------------|
| DATABASE_URL      | PostgreSQL connection string   |
| NEXTAUTH_URL      | Application URL                |
| NEXTAUTH_SECRET   | Session encryption secret      |

## License

Private — Enterprise Internal Use
