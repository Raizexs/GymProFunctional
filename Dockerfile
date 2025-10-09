# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY src/frontend/package*.json ./src/frontend/
COPY src/backend/package*.json ./src/backend/

# Install dependencies
RUN npm install
RUN cd src/frontend && npm install
RUN cd src/backend && npm install

# Copy source code
COPY . .

# Build frontend
RUN cd src/frontend && npm run build

# Production stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Copy backend dependencies
COPY src/backend/package*.json ./
RUN npm install --only=production

# Copy backend source
COPY src/backend/ ./

# Copy built frontend
COPY --from=builder /app/src/frontend/build ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["node", "server.js"]
