# ── Stage 1: dependencies ────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files only — layer caches unless deps change
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ── Stage 2: production image ────────────────────────────────
FROM node:20-alpine AS runner

# Security: run as non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

# Copy installed deps from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY --chown=appuser:appgroup . .

# Remove dev-only files from the image
RUN rm -rf tests/ .env.example

USER appuser

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "server.js"]
