#!/bin/sh
set -e

. /app/scripts/build-database-url.sh
build_database_url

exec npx prisma studio --hostname 0.0.0.0 --port 5555 --browser none
