# Stage 1: Build the Next.js application
FROM node:22-slim AS builder
ARG ENV=dev
WORKDIR /app

# Install dependencies for Puppeteer
RUN apt-get update && \
    apt-get install -y wget gnupg ca-certificates procps libxss1 && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable && \
    rm -rf /var/lib/apt/lists/*

# Set Puppeteer environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

RUN cat .env.${ENV} > ./.env && \
    rm .env.*

# Build the application for static export
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:1.29.1

# Copy the static build output from the builder stage
COPY --from=builder /app/out /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the web server
EXPOSE 80
