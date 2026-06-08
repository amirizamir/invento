# =============================================================================
# VM Inventory Manager — Multi-stage Dockerfile (Linux)
# Targets: production | migrator | development | test | studio | lint
# =============================================================================

FROM node:20-bookworm-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# --- Dependencies (skip postinstall; Prisma runs in dedicated stage) ---
FROM base AS deps
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
COPY package.json ./
RUN npm install --ignore-scripts --legacy-peer-deps

# --- Prisma client + engines ---
FROM base AS prisma
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma
COPY scripts/prisma-generate.sh ./scripts/
RUN chmod +x ./scripts/prisma-generate.sh \
  && sh ./scripts/prisma-generate.sh

# --- Next.js production build ---
FROM base AS builder
ARG NEXTAUTH_URL=http://localhost:3000
ARG NEXTAUTH_SECRET=docker-build-secret-minimum-32-characters
COPY --from=prisma /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://postgres:postgres@postgres:5432/vm_inventory?schema=public"
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
RUN npm run build

# --- DB schema push + seed (one-shot init container) ---
FROM base AS migrator
RUN apt-get update \
  && apt-get install -y --no-install-recommends postgresql-client \
  && rm -rf /var/lib/apt/lists/*
COPY --from=prisma /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma
COPY scripts/wait-for-postgres.sh scripts/migrate.sh scripts/build-database-url.sh ./scripts/
RUN chmod +x ./scripts/wait-for-postgres.sh ./scripts/migrate.sh ./scripts/build-database-url.sh
CMD ["sh", "./scripts/migrate.sh"]

# --- Production runtime ---
FROM base AS production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN apt-get update \
  && apt-get install -y --no-install-recommends wget \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client

COPY scripts/docker-entrypoint.sh scripts/build-database-url.sh ./scripts/
RUN chmod +x ./scripts/docker-entrypoint.sh ./scripts/build-database-url.sh

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/login > /dev/null 2>&1 || exit 1

ENTRYPOINT ["sh", "./scripts/docker-entrypoint.sh"]

# --- Development (hot reload) ---
FROM base AS development
RUN apt-get update \
  && apt-get install -y --no-install-recommends postgresql-client \
  && rm -rf /var/lib/apt/lists/*
COPY --from=prisma /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public \
  && chmod +x ./scripts/wait-for-postgres.sh ./scripts/migrate.sh ./scripts/build-database-url.sh
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
CMD ["sh", "-c", "sh ./scripts/migrate.sh && npm run dev -- -H 0.0.0.0 -p 3000"]

# --- Test ---
FROM base AS test
COPY --from=prisma /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=test
ENV CI=true
CMD ["npm", "test", "--", "--passWithNoTests"]

# --- Prisma Studio ---
FROM base AS studio
RUN apt-get update \
  && apt-get install -y --no-install-recommends postgresql-client \
  && rm -rf /var/lib/apt/lists/*
COPY --from=prisma /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma
COPY scripts/studio-entrypoint.sh scripts/build-database-url.sh ./scripts/
RUN chmod +x ./scripts/studio-entrypoint.sh ./scripts/build-database-url.sh
EXPOSE 5555
ENTRYPOINT ["sh", "./scripts/studio-entrypoint.sh"]

# --- Lint ---
FROM base AS lint
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["npm", "run", "lint"]
