# =============================================================================
# VM Inventory Manager — Multi-stage Dockerfile
#
# Targets:
#   production  — Next.js standalone app (default)
#   migrator    — DB schema push + seed (one-shot init)
#   development — Hot reload dev server
#   test        — Jest unit/component tests
#   studio      — Prisma Studio UI
#   lint        — ESLint
# =============================================================================

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# -----------------------------------------------------------------------------
# Dependencies
# -----------------------------------------------------------------------------
FROM base AS deps
COPY package.json ./
RUN npm install --legacy-peer-deps

# -----------------------------------------------------------------------------
# Build Next.js standalone production bundle
# -----------------------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://postgres:postgres@postgres:5432/vm_inventory?schema=public"
RUN npx prisma generate
RUN npm run build

# -----------------------------------------------------------------------------
# Database migrator + seeder (one-shot init container)
# -----------------------------------------------------------------------------
FROM base AS migrator
RUN apk add --no-cache postgresql-client
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma
COPY scripts/wait-for-postgres.sh scripts/migrate.sh ./scripts/
RUN chmod +x ./scripts/wait-for-postgres.sh ./scripts/migrate.sh \
  && npx prisma generate
CMD ["sh", "./scripts/migrate.sh"]

# -----------------------------------------------------------------------------
# Production runtime
# -----------------------------------------------------------------------------
FROM base AS production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

COPY scripts/docker-entrypoint.sh ./scripts/
RUN chmod +x ./scripts/docker-entrypoint.sh \
  && apk add --no-cache wget

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
RUN apk add --no-cache postgresql-client
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public \
  && npx prisma generate \
  && chmod +x ./scripts/wait-for-postgres.sh ./scripts/migrate.sh
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
CMD ["sh", "-c", "sh ./scripts/migrate.sh && npm run dev -- -H 0.0.0.0 -p 3000"]

# -----------------------------------------------------------------------------
# Test runner
# -----------------------------------------------------------------------------
FROM base AS test
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV NODE_ENV=test
ENV CI=true
CMD ["npm", "test", "--", "--passWithNoTests"]

# -----------------------------------------------------------------------------
# Prisma Studio
# -----------------------------------------------------------------------------
FROM base AS studio
RUN apk add --no-cache postgresql-client
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma
RUN npx prisma generate
EXPOSE 5555
CMD ["npx", "prisma", "studio", "--hostname", "0.0.0.0", "--port", "5555", "--browser", "none"]

# -----------------------------------------------------------------------------
# Lint
# -----------------------------------------------------------------------------
FROM base AS lint
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["npm", "run", "lint"]
