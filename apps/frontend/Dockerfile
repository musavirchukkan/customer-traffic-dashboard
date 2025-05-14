# apps/frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json files for workspace
COPY package.json ./
COPY turbo.json ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/frontend ./apps/frontend

# Build shared package first, then frontend
RUN npm run build --workspace=shared
RUN npm run build --workspace=frontend

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built application
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

# Set production environment
ENV NODE_ENV=production
ENV PORT 3000

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "apps/frontend/server.js"]