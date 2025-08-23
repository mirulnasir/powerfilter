FROM node:22.18-alpine AS base

FROM base AS builder
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Copy source and build
COPY src ./src
COPY next.config.ts .
COPY tsconfig.json .
RUN pnpm run build

FROM base AS runner
WORKDIR /app

# Security: create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy standalone build (no node_modules needed!)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

ENV NODE_ENV=production
CMD ["node", "server.js"]