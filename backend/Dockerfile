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
RUN npm run build

# Stage 4: Production
FROM base AS production
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
USER nestjs
EXPOSE 4000
CMD ["dumb-init", "node", "dist/main"]
