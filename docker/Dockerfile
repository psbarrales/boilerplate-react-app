# Stage 1: Build environment
FROM node:18 AS runner

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Copy entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

# Set permissions for entrypoint script
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose port
EXPOSE 5173

# Set entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
