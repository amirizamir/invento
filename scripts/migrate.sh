#!/bin/sh
set -e

. /app/scripts/wait-for-postgres.sh

echo "Applying database schema..."
npx prisma db push --accept-data-loss

if [ "${SEED_DATABASE:-true}" = "true" ]; then
  echo "Seeding database..."
  npx prisma db seed
else
  echo "Skipping seed (SEED_DATABASE=${SEED_DATABASE})."
fi

echo "Database initialization complete."
