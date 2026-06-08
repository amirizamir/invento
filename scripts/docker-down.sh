#!/usr/bin/env bash
# Stop all stacks and remove local database data (fresh start)
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
docker compose down 2>/dev/null || true
docker compose -f docker-compose.dev.yml down 2>/dev/null || true
rm -rf ./data ./data-dev
echo "All containers stopped. Database data removed from ./data/"
