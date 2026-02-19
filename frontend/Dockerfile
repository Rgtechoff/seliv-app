# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache dumb-init

# Stage 2: Dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Stage 3: Build
FROM deps AS builder
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Variables publiques Next.js — baked au build time
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
RUN npm run build

# Stage 4: Runner
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["dumb-init", "node", "server.js"]
