# syntax=docker/dockerfile:1.7
# ---------------------------------------------------------------------------
# Sliva News — Next.js 16 App Router, SSR, self-hosted on the Slivadoc VM
#
# Build:  docker build --platform=linux/amd64 -t ghcr.io/s-v2/sliva-news:latest .
# Run:    docker run --rm -p 3000:3000 ghcr.io/s-v2/sliva-news:latest
# ---------------------------------------------------------------------------
ARG NODE_IMAGE=22-alpine

FROM node:${NODE_IMAGE} AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund --ignore-scripts

FROM node:${NODE_IMAGE} AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:${NODE_IMAGE} AS runtime
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV TZ=Asia/Jakarta
RUN apk add --no-cache tzdata \
    && addgroup --system --gid 10001 slivadoc \
    && adduser --system --uid 10001 --ingroup slivadoc slivadoc
WORKDIR /app
COPY --from=build --chown=10001:10001 /app/public ./public
COPY --from=build --chown=10001:10001 /app/.next/standalone ./
COPY --from=build --chown=10001:10001 /app/.next/static ./.next/static
USER 10001
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1
CMD ["node", "server.js"]
