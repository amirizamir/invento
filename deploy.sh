#!/usr/bin/env bash
# =============================================================================
# VM Inventory Manager — Linux Docker deploy script
# Usage: chmod +x deploy.sh && ./deploy.sh
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: Docker is not installed."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "ERROR: Docker Compose plugin is not available."
  exit 1
fi

if [ ! -f .env ]; then
  echo "Creating .env from .env.example ..."
  cp .env.example .env
  echo ""
  echo "IMPORTANT: Edit .env before production use:"
  echo "  - NEXTAUTH_URL=http://YOUR_SERVER_IP:${APP_PORT:-3000}"
  echo "  - POSTGRES_PASSWORD=strong-password"
  echo "  - NEXTAUTH_SECRET=random-32+-char-string"
  echo "  - ADMIN_USERNAME=zamir.amiri"
  echo "  - ADMIN_PASSWORD=strong-admin-password"
  echo ""
fi

# Keep DATABASE_URL in sync with postgres credentials
POSTGRES_USER_VAL="$(grep -E '^POSTGRES_USER=' .env | cut -d= -f2- || echo postgres)"
POSTGRES_PASSWORD_VAL="$(grep -E '^POSTGRES_PASSWORD=' .env | cut -d= -f2- || echo postgres)"
POSTGRES_DB_VAL="$(grep -E '^POSTGRES_DB=' .env | cut -d= -f2- || echo vm_inventory)"
sed -i "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://${POSTGRES_USER_VAL}:${POSTGRES_PASSWORD_VAL}@postgres:5432/${POSTGRES_DB_VAL}?schema=public|" .env

echo "==> Building and starting containers ..."
docker compose up -d --build

echo ""
echo "==> Waiting for app health ..."
TRIES=0
until docker compose ps app 2>/dev/null | grep -q "(healthy)" || [ "$TRIES" -ge 30 ]; do
  TRIES=$((TRIES + 1))
  sleep 5
done

APP_PORT_VAL="$(grep -E '^APP_PORT=' .env | cut -d= -f2- || echo 3000)"
NEXTAUTH_URL_VAL="$(grep -E '^NEXTAUTH_URL=' .env | cut -d= -f2- || echo "http://localhost:${APP_PORT_VAL}")"
ADMIN_USERNAME_VAL="$(grep -E '^ADMIN_USERNAME=' .env | cut -d= -f2- || echo zamir.amiri)"

echo ""
echo "============================================"
echo " AHG is running"
echo " URL:      ${NEXTAUTH_URL_VAL}"
echo " Login:    ${ADMIN_USERNAME_VAL}"
echo " Password: (ADMIN_PASSWORD from .env)"
echo "============================================"
echo ""
echo "Commands:"
echo "  docker compose logs -f app     # view logs"
echo "  docker compose ps              # status"
echo "  docker compose down            # stop (data kept in ./data/)"
echo "  rm -rf ./data && docker compose down  # stop + wipe database"
