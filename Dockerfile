# =============================================================================
# VM Inventory Manager — Multi-stage Dockerfile
# Base: Debian slim (reliable Prisma engine downloads vs Alpine/musl)
# =============================================================================

FROM node:20-bookworm-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# -----------------------------------------------------------------------------
# npm dependencies (NO postinstall — schema not present yet)
# -----------------------------------------------------------------------------
FROM base AS deps
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
COPY package.json ./
RUN npm install --ignore-scripts --legacy-peer-deps

# -----------------------------------------------------------------------------
# Prisma client generation (schema + retry for network flakiness)
# -----------------------------------------------------------------------------
FROM base AS prisma
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma
COPY scripts/prisma-generate.sh ./scripts/
RUN chmod +x ./scripts/prisma-generate.sh \
  && sh ./scripts/prisma-generate.sh

# -----------------------------------------------------------------------------
# Build Next.js standalone production bundle
# -----------------------------------------------------------------------------
FROM base AS builder
COPY --from=prisma /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://postgres:postgres@postgres:5432/vm_inventory?schema=public"
ENV NEXTAUTH_URL="http://localhost:3000"
ENV NEXTAUTH_SECRET="docker-build-secret-minimum-32-characters"
RUN npm run build

# -----------------------------------------------------------------------------
# Database migrator + seeder (one-shot init container)
# -----------------------------------------------------------------------------
FROM base AS migrator
RUN apt-get update \
  && apt-get install -y --no-install-recommends postgresql-client \
  && rm -rf /var/lib/apt/lists/*
COPY --from=prisma /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma
COPY scripts/wait-for-postgres.sh scripts/migrate.sh ./scripts/
RUN chmod +x ./scripts/wait-for-postgres.sh ./scripts/migrate.sh
CMD ["sh", "./scripts/migrate.sh"]

# -----------------------------------------------------------------------------
# Production runtime
# -----------------------------------------------------------------------------
FROM base AS production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends wget \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY scripts/docker-entrypoint.sh ./scripts/
RUN chmod +x ./scripts/docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/login > /dev/null 2>&1 || exit 1

ENTRYPOINT ["sh", "./scripts/docker-entrypoint.sh"]

# -----------------------------------------------------------------------------
# Development (hot reload)
# -----------------------------------------------------------------------------
FROM base AS development
RUN apt-get update \
  && apt-get install -y --no-install-recommends postgresql-client \
  && rm -rf /var/lib/apt/lists/*
COPY --from=prisma /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public \
  && chmod +x ./scripts/wait-for-postgres.sh ./scripts/migrate.sh
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
CMD ["sh", "-c", "sh ./scripts/migrate.sh && npm run dev -- -H 0.0.0.0 -p 3000"]

# -----------------------------------------------------------------------------
# Test runner
# -----------------------------------------------------------------------------
FROM base AS test
COPY --from=prisma /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=test
ENV CI=true
CMD ["npm", "test", "--", "--passWithNoTests"]

# -----------------------------------------------------------------------------
# Prisma Studio
# -----------------------------------------------------------------------------
FROM base AS studio
RUN apt-get update \
  && apt-get install -y --no-install-recommends postgresql-client \
  && rm -rf /var/lib/apt/lists/*
COPY --from=prisma /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma
EXPOSE 5555
CMD ["npx", "prisma", "studio", "--hostname", "0.0.0.0", "--port", "5555", "--browser", "none"]

# -----------------------------------------------------------------------------
# Lint
# -----------------------------------------------------------------------------
FROM base AS lint
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["npm", "run", "lint"]
