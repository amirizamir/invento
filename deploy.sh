#!/usr/bin/env bash
# Optional wrapper — same as: docker compose up -d --build
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example — edit it before production use."
fi

docker compose up -d --build

echo ""
echo "Done. Open NEXTAUTH_URL from .env in your browser."
echo "  docker compose logs -f app"
echo "  docker compose ps"
