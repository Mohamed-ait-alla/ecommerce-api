# ── deps: install All dependencies ─────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN  npm ci
ENV DATABASE_URL="postgresql://user:password@localhost:5432/placeholder"
RUN  npx prisma generate

# ── build: compile Typescript to dist/ ──────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps ./app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── prod-deps: install ONLY production dependencies, in a clean layer ───
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN  npm ci --omit=dev
ENV DATABASE_URL="postgresql://user:password@localhost:5432/placeholder"
RUN  npx prisma generate

# ── runner: the final image that actually ships ──────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# add a user to run the app as non-root user, this is for security purposes
RUN addgroup -S nodejs && adduser -S expressjs -G nodejs

COPY --from=prod-deps ./app/node_modules ./node_modules
COPY --from=build ./app/dist ./dist
COPY --from=build ./app/prisma ./prisma
COPY prisma.config.ts ./
COPY package*.json ./
COPY ./docker/entrypoint.sh ./entrypoint.sh

RUN chmod +x entrypoint.sh && chown -R expressjs:nodejs /app

USER expressjs

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
   CMD wget -qO- http://localhost:4000/health || exit 1

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "dist/server.js"]