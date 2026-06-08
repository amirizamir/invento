#!/bin/sh
set -e

. /app/scripts/wait-for-postgres.sh
. /app/scripts/build-database-url.sh
build_database_url

echo "Applying database schema..."
if ! npx prisma db push --accept-data-loss; then
  echo ""
  echo "ERROR: prisma db push failed."
  echo "Check POSTGRES_USER, POSTGRES_PASSWORD, and POSTGRES_DB in .env"
  echo "Use quotes for passwords with special characters:"
  echo '  POSTGRES_PASSWORD="your-password"'
  exit 1
fi

if [ "${BOOTSTRAP_ADMIN:-true}" = "true" ]; then
  echo "Running admin bootstrap (skipped if users already exist)..."
  node prisma/seed.js
else
  echo "Skipping admin bootstrap (BOOTSTRAP_ADMIN=${BOOTSTRAP_ADMIN})."
fi

echo "Database initialization complete."
