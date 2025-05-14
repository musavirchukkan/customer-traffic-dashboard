# apps/backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json files for workspace
COPY package.json ./
COPY turbo.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# Build shared package first, then backend
RUN npm run build --workspace=shared
RUN npm run build --workspace=backend

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

# Copy only production dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/packages/shared/package.json ./packages/shared/

# Set production environment
ENV NODE_ENV=production

# Install only production dependencies
RUN npm install --omit=dev

# Copy built application
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Set user to non-root for security
USER node

# Expose the port the app runs on
EXPOSE 5000

# Start the application
CMD ["node", "apps/backend/dist/index.js"]