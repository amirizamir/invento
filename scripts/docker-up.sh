#!/usr/bin/env bash
# =============================================================================
# VM Inventory Manager — one-command Docker bootstrap (Linux/macOS)
# Usage: ./scripts/docker-up.sh [prod|dev|tools]
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MODE="${1:-prod}"
ENV_FILE="${ENV_FILE:-.env.docker}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE — copy from .env.docker.example or create it."
  exit 1
fi

case "$MODE" in
  prod)
    echo "==> Starting PRODUCTION stack (postgres + init-db + app)..."
    docker compose --env-file "$ENV_FILE" up --build -d
    echo ""
    echo "VM Inventory Manager is starting."
    echo "  App:  http://localhost:${APP_PORT:-3000}"
    echo "  Logs: docker compose logs -f app"
    echo ""
    echo "Default login: admin@vminventory.local / Password123!"
    ;;
  dev)
    echo "==> Starting DEVELOPMENT stack (postgres + app with hot reload)..."
    docker compose -f docker-compose.dev.yml --env-file "$ENV_FILE" up --build
    ;;
  tools)
    echo "==> Starting TOOLS (postgres + prisma studio on :5555)..."
    docker compose --env-file "$ENV_FILE" --profile tools up --build -d postgres studio
    echo "  Prisma Studio: http://localhost:${STUDIO_PORT:-5555}"
    ;;
  test)
    echo "==> Running tests in Docker..."
    docker compose --env-file "$ENV_FILE" --profile tools run --rm test
    ;;
  lint)
    echo "==> Running lint in Docker..."
    docker compose --env-file "$ENV_FILE" --profile tools run --rm lint
    ;;
  seed)
    echo "==> Re-running database migration + seed..."
    docker compose --env-file "$ENV_FILE" run --rm init-db
    ;;
  down)
    echo "==> Stopping all stacks..."
    docker compose --env-file "$ENV_FILE" down 2>/dev/null || true
    docker compose -f docker-compose.dev.yml --env-file "$ENV_FILE" down 2>/dev/null || true
    ;;
  reset)
    echo "==> Resetting volumes and restarting production stack..."
    docker compose --env-file "$ENV_FILE" down -v
    docker compose --env-file "$ENV_FILE" up --build -d
    ;;
  *)
    echo "Usage: $0 {prod|dev|tools|test|lint|seed|down|reset}"
    exit 1
    ;;
esac
