# =============================================================================
# Docker-only deployment (Linux)
# No Node.js, npm, or PostgreSQL required on the host.
# =============================================================================

## Prerequisites

- Linux server with Docker Engine 24+
- Docker Compose v2 (`docker compose`)

```bash
docker --version
docker compose version
```

## Deploy (3 commands)

```bash
cd invento
cp .env.example .env
nano .env    # set NEXTAUTH_URL to http://YOUR_SERVER_IP:3000
```

Or use the deploy script:

```bash
chmod +x deploy.sh
./deploy.sh
```

Manual deploy:

```bash
docker compose up -d --build
```

Open the URL from `NEXTAUTH_URL` in `.env`.

**Default login:** `admin@vminventory.local` / `Password123!`

---

## What Docker runs

| Service   | Container            | Port  | Role                          |
|-----------|----------------------|-------|-------------------------------|
| postgres  | vm-inventory-db      | 5432  | PostgreSQL database           |
| init-db   | vm-inventory-init-db | —     | Schema + seed (runs once)     |
| app       | vm-inventory-app     | 3000  | Next.js production server     |

Everything is built from the **Dockerfile** — no host dependencies.

---

## Configuration (`.env`)

| Variable          | Required | Description                              |
|-------------------|----------|------------------------------------------|
| NEXTAUTH_URL      | Yes      | Public URL, e.g. `http://10.0.0.5:3000`  |
| NEXTAUTH_SECRET   | Yes      | Random string, 32+ characters            |
| POSTGRES_PASSWORD | Yes      | Database password                        |
| APP_PORT          | No       | Host port (default 3000)                 |
| SEED_DATABASE     | No       | `true` on first deploy                   |

After editing passwords, `deploy.sh` syncs `DATABASE_URL` automatically.

---

## Daily commands

```bash
# Status
docker compose ps

# Logs
docker compose logs -f app

# Restart after config change
docker compose up -d --build

# Re-seed database (keeps volume)
docker compose run --rm init-db

# Stop
docker compose down

# Full reset (deletes all VM data)
docker compose down -v
docker compose up -d --build
```

---

## Optional tools profile

```bash
# Prisma Studio (database UI) on port 5555
docker compose --profile tools up -d studio

# Run tests inside Docker
docker compose --profile tools run --rm test

# Run ESLint inside Docker
docker compose --profile tools run --rm lint
```

---

## Development mode (hot reload)

```bash
docker compose -f docker-compose.dev.yml up --build
```

---

## Troubleshooting

**Build fails**

```bash
docker compose build --no-cache app 2>&1 | tail -80
```

Ensure outbound HTTPS to `binaries.prisma.sh` is allowed (Prisma engines).

**App unhealthy**

```bash
docker compose logs init-db
docker compose logs app
```

**Login redirect loop**

Set `NEXTAUTH_URL` in `.env` to the exact URL you use in the browser (including port).

**Firewall**

```bash
sudo ufw allow 3000/tcp
```

---

## Architecture

```
┌──────────── docker compose ────────────┐
│  postgres ──► init-db ──► app :3000    │
│     │              │            │      │
│  volume         one-shot    standalone │
└────────────────────────────────────────┘
```

All application code is compiled inside the Docker **builder** stage and shipped as a **standalone** Next.js bundle in the **production** image.
