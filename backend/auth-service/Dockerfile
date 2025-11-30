# Production Dockerfile for Auth Service
FROM node:24-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Do not rely on a fixed EXPOSE for Render; kept for local use
EXPOSE 5000

# Run with node (no dev watcher)
CMD ["node", "app.js"]
