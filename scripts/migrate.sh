#!/bin/sh
set -e

. /app/scripts/wait-for-postgres.sh

echo "Applying database schema..."
npx prisma db push --accept-data-loss

if [ "${BOOTSTRAP_ADMIN:-true}" = "true" ]; then
  echo "Running admin bootstrap (skipped if users already exist)..."
  npx prisma db seed
else
  echo "Skipping admin bootstrap (BOOTSTRAP_ADMIN=${BOOTSTRAP_ADMIN})."
fi

echo "Database initialization complete."
