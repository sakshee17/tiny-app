# ─────────────────────────────────────────────────────────────────────────────
# Multi-stage Dockerfile — Frontend (React / Vite)
#
# Stages:
#   dev         → runs the Vite dev server (used by docker-compose locally)
#   builder     → compiles the production bundle with `vite build`
#   production  → serves the static bundle via nginx:alpine (CI/CD default)
#
# Local dev:   docker-compose uses `target: dev` (hot-reload, port 5174)
# CI/CD build: no --target → defaults to final `production` stage (port 80)
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Development ──────────────────────────────────────────────────────
FROM node:18-alpine AS dev

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 5174

CMD ["npm", "run", "dev", "--", "--host"]

# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 3: Production (Nginx) ───────────────────────────────────────────────
FROM nginx:alpine AS production

# Copy compiled assets from builder stage
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# SPA routing config (handles client-side routes)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
