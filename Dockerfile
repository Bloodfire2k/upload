# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Install dependencies
RUN npm install --network-timeout=600000

# Copy source files
COPY . .

# Build the app
ENV CI=false
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Create directory structure
RUN mkdir -p /usr/share/nginx/html/scan

# Copy built files
COPY --from=builder /app/build/ /usr/share/nginx/html/scan/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Verify the file structure
RUN ls -la /usr/share/nginx/html/scan/

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 