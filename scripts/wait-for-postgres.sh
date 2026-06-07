#!/bin/sh
set -e

host="${POSTGRES_HOST:-postgres}"
port="${POSTGRES_PORT:-5432}"
user="${POSTGRES_USER:-postgres}"
max_retries="${POSTGRES_WAIT_RETRIES:-30}"
retry=0

echo "Waiting for PostgreSQL at ${host}:${port}..."

until pg_isready -h "$host" -p "$port" -U "$user" > /dev/null 2>&1; do
  retry=$((retry + 1))
  if [ "$retry" -ge "$max_retries" ]; then
    echo "PostgreSQL is unavailable after ${max_retries} attempts — exiting."
    exit 1
  fi
  echo "PostgreSQL unavailable — retry ${retry}/${max_retries}..."
  sleep 2
done

echo "PostgreSQL is ready."
