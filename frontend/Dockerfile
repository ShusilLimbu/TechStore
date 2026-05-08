# ─────────────────────────────────────────────────────────────
# Stage 1 — Builder
# Installs deps and runs `npm run build`
# VITE_* vars are baked into the bundle here — not at runtime
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps first (separate layer — only re-runs when package.json changes)
COPY package*.json ./

RUN npm ci --frozen-lockfile

# Build-time env vars passed from docker-compose build.args
# Default to empty string so nginx proxy handles routing (no absolute URL needed)
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy source and build
COPY . .
RUN npm run build
# Output: /app/dist


# ─────────────────────────────────────────────────────────────
# Stage 2 — Runtime (nginx)
# Final image has zero Node, zero source code, zero dev deps
# ─────────────────────────────────────────────────────────────
FROM nginx:1.25-alpine AS runtime

# Remove the default nginx site config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx configs
COPY nginx/nginx.conf      /etc/nginx/nginx.conf
COPY nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

# Copy built React app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Fix permissions so nginx (non-root) can read files
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chmod -R 755 /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost/health || exit 1