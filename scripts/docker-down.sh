#!/usr/bin/env bash
# Stop all stacks and remove volumes (fresh start)
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
docker compose down -v 2>/dev/null || true
docker compose -f docker-compose.dev.yml down -v 2>/dev/null || true
echo "All containers stopped. Database volumes removed."
