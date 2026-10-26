# syntax=docker/dockerfile:1

# ---------- Stage 1: install production dependencies ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---------- Stage 2: minimal runtime image ----------
FROM node:20-alpine AS runtime
LABEL maintainer="Kasing" \
      service="auth-service"

ENV NODE_ENV=production \
    PORT=3002
WORKDIR /app

# Copy only what the app needs, owned by the non-root "node" user
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json index.js dbConnect.js userSchema.js ./

# Never run as root inside the container
USER node

EXPOSE 3002
CMD ["node", "index.js"]
