# =============================================================================
# Stage 1: Build the React frontend
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./
RUN npm ci --prefer-offline

# Copy source and build
COPY . .
RUN npm run build

# =============================================================================
# Stage 2: Serve using Nginx
# =============================================================================
FROM nginx:alpine

# Copy built files to Nginx web directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Configure Nginx to listen on port 8080 (Cloud Run port)
RUN sed -i 's/listen\(.*\)80;/listen 8080;/' /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
