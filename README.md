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

## Quick Start (Docker — recommended)

Everything runs in Docker. You only need **Docker Engine + Compose** (no Node.js on the host).

See **[DOCKER.md](./DOCKER.md)** for the full guide.

```bash
cp .env.docker .env

# Linux one-liner
chmod +x scripts/docker-up.sh
./scripts/docker-up.sh prod

# Or standard compose
docker compose --env-file .env.docker up --build -d
```

On a remote Linux server, set `NEXTAUTH_URL` in `.env.docker` to your server IP:

```bash
NEXTAUTH_URL=http://192.168.1.100:3000
```

Open **http://YOUR_HOST:3000** and sign in with the credentials below.

### All Docker components

| Component      | Command |
|----------------|---------|
| Production app | `docker compose --env-file .env.docker up --build -d` |
| Dev (hot reload) | `docker compose -f docker-compose.dev.yml --env-file .env.docker up --build` |
| Tests (Jest)   | `docker compose --env-file .env.docker --profile tools run --rm test` |
| Lint (ESLint)  | `docker compose --env-file .env.docker --profile tools run --rm lint` |
| Prisma Studio  | `docker compose --env-file .env.docker --profile tools up -d postgres studio` |
| Re-seed DB     | `docker compose --env-file .env.docker run --rm init-db` |

### npm / Make shortcuts

```bash
npm run docker:up       # production
npm run docker:dev      # development
npm run docker:test     # tests
npm run docker:lint     # lint
npm run docker:studio   # prisma studio
npm run docker:reset    # wipe DB + restart

make up    make test    make studio    make seed    make reset
```

---

## Local Development (without Docker)

### Prerequisites

- Node.js 20+
- PostgreSQL 16+

```bash
npm install
cp .env.example .env
docker compose up postgres -d   # DB only
npm run db:push
npm run db:seed
npm run dev
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
