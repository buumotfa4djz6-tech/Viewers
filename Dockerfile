# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY platform/app/package.json ./platform/app/
COPY platform/core/package.json ./platform/core/
COPY platform/ui-next/package.json ./platform/ui-next/
COPY extensions/*/package.json ./extensions/
COPY modes/*/package.json ./modes/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Stage 2: Production
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/platform/app/dist /usr/share/nginx/html

# Copy configuration
COPY config/ /usr/share/nginx/html/config/

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
