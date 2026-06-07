#!/bin/sh
# Retry prisma generate — handles flaky downloads from binaries.prisma.sh
set -e

MAX="${PRISMA_GENERATE_RETRIES:-5}"
WAIT="${PRISMA_GENERATE_RETRY_WAIT:-10}"
n=1

while [ "$n" -le "$MAX" ]; do
  echo "==> prisma generate (attempt ${n}/${MAX})..."
  if npx prisma generate; then
    echo "==> prisma generate succeeded."
    exit 0
  fi
  echo "==> prisma generate failed, retrying in ${WAIT}s..."
  n=$((n + 1))
  sleep "$WAIT"
done

echo "==> prisma generate failed after ${MAX} attempts."
exit 1
