# Docker Guide — VM Inventory Manager

Everything runs in Docker. No Node.js or PostgreSQL installation required on the host.

## Prerequisites

- Docker Engine 24+
- Docker Compose v2+

## Quick start (Linux)

```bash
cd invento
cp .env.docker .env

# One command — builds and starts everything
chmod +x scripts/docker-up.sh
./scripts/docker-up.sh prod
```

Or:

```bash
docker compose --env-file .env.docker up --build -d
```

Open **http://YOUR_SERVER_IP:3000**

> Set `NEXTAUTH_URL=http://YOUR_SERVER_IP:3000` in `.env.docker` before starting.

## Default login

| Role     | Email                      | Password     |
|----------|----------------------------|--------------|
| Admin    | admin@vminventory.local    | Password123! |
| Operator | operator@vminventory.local | Password123! |
| Viewer   | viewer@vminventory.local   | Password123! |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     docker-compose.yml                       │
├─────────────┬──────────────┬─────────────┬──────────────────┤
│  postgres   │   init-db    │     app     │  tools (profile) │
│  :5432      │  push+seed   │   :3000     │  test/lint/studio│
│  (volume)   │  (one-shot)  │  Next.js    │                  │
└─────────────┴──────────────┴─────────────┴──────────────────┘
```

### Services

| Service    | Image target  | Purpose                          |
|------------|---------------|----------------------------------|
| postgres   | postgres:16   | PostgreSQL database              |
| init-db    | `migrator`    | Schema push + seed (runs once)   |
| app        | `production`  | Next.js standalone server        |
| test       | `test`        | Jest tests (tools profile)       |
| lint       | `lint`        | ESLint (tools profile)           |
| studio     | `studio`      | Prisma Studio UI (tools profile) |

---

## Commands

### Production

```bash
# Start
docker compose --env-file .env.docker up --build -d

# Logs
docker compose logs -f app

# Stop
docker compose --env-file .env.docker down

# Reset DB + re-seed
docker compose --env-file .env.docker down -v
docker compose --env-file .env.docker up --build -d

# Re-seed only (keep data volume)
docker compose --env-file .env.docker run --rm init-db
```

### Development (hot reload)

```bash
docker compose -f docker-compose.dev.yml --env-file .env.docker up --build
```

### Tools

```bash
# Run tests
docker compose --env-file .env.docker --profile tools run --rm test

# Run lint
docker compose --env-file .env.docker --profile tools run --rm lint

# Prisma Studio (http://localhost:5555)
docker compose --env-file .env.docker --profile tools up -d postgres studio
```

### Make shortcuts

```bash
make up        # production
make up-dev    # development
make test      # jest in docker
make lint      # eslint in docker
make studio    # prisma studio
make seed      # re-run init-db
make reset     # wipe volumes + restart
make logs      # tail app logs
make shell     # exec into app container
```

### Helper script

```bash
./scripts/docker-up.sh prod    # production
./scripts/docker-up.sh dev     # development
./scripts/docker-up.sh test    # run tests
./scripts/docker-up.sh lint    # run lint
./scripts/docker-up.sh tools   # postgres + prisma studio
./scripts/docker-up.sh seed    # re-migrate + seed
./scripts/docker-up.sh reset   # wipe + restart
./scripts/docker-up.sh down    # stop all
```

---

## Environment variables

| Variable          | Default              | Description                    |
|-------------------|----------------------|--------------------------------|
| POSTGRES_USER     | postgres             | DB username                    |
| POSTGRES_PASSWORD | postgres             | DB password                    |
| POSTGRES_DB       | vm_inventory         | Database name                  |
| POSTGRES_PORT     | 5432                 | Host port for PostgreSQL       |
| APP_PORT          | 3000                 | Host port for web app          |
| STUDIO_PORT       | 5555                 | Host port for Prisma Studio    |
| NEXTAUTH_URL      | http://localhost:3000| Public URL of the app          |
| NEXTAUTH_SECRET   | (required)           | Session secret (32+ chars)     |
| SEED_DATABASE     | true                 | Seed on init-db run            |

---

## Troubleshooting

**Prisma binary download fails during build**

The build skips `postinstall` and runs `prisma generate` in a dedicated stage with retries. If it still fails, check outbound HTTPS to `binaries.prisma.sh`:

```bash
docker run --rm curlimages/curl -I https://binaries.prisma.sh
```

If blocked, set a mirror before building:

```bash
export PRISMA_ENGINES_MIRROR=https://your-mirror/prisma
docker compose --env-file .env.docker build --no-cache
```

**init-db fails**
```bash
docker compose logs init-db
docker compose run --rm init-db
```

**App unhealthy / won't start**
```bash
docker compose logs app
# Ensure init-db completed: docker compose ps -a
```

**Port already in use**
```bash
# Change APP_PORT or POSTGRES_PORT in .env.docker
APP_PORT=3001 docker compose --env-file .env.docker up -d
```

**Rebuild from scratch**
```bash
docker compose down -v --rmi local
docker compose --env-file .env.docker up --build -d
```

**Check container health**
```bash
docker compose ps
docker inspect vm-inventory-app --format='{{.State.Health.Status}}'
```
