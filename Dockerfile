# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS migrator
COPY prisma ./prisma
RUN npx prisma generate
CMD ["sh", "-c", "node prisma/prepare-product-source-id.js && npx prisma db push --skip-generate"]

FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ARG NEXT_DEPLOYMENT_ID=local
ENV NEXT_DEPLOYMENT_ID=$NEXT_DEPLOYMENT_ID
RUN npx prisma generate
RUN npm run build
CMD ["npx", "prisma", "db", "push", "--skip-generate"]

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# The generated Prisma client is required by the standalone server. The Prisma
# CLI itself is NOT copied: schema changes run through the `migrator` compose
# service, which is built from the full `builder` stage.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
