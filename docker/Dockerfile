FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pinned pnpm version
RUN npm install -g pnpm@10.10.0

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies with force flag to recreate lockfile
RUN pnpm install --frozen-lockfile --ignore-scripts --force


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install same pnpm version in the builder stage
RUN npm install -g pnpm@10.10.0

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
# ENV NEXT_SKIP_OPTIMIZE_IMAGES=1

# Set build-time environment placeholders
# Clerk validates key during build, https://github.com/clerk/javascript/blob/73ce3f309b90c7ec065bc6829ec679b8ec77db2f/packages/shared/src/keys.ts#L78
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_JA==
ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=PLACEHOLDER_NEXT_PUBLIC_CLERK_SIGN_IN_URL
ENV NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=PLACEHOLDER_NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
ENV NEXT_PUBLIC_DEFAULT_ORG_ID=PLACEHOLDER_NEXT_PUBLIC_DEFAULT_ORG_ID

# Build the Next.js application
# Explicitly set NODE_ENV to production to ensure standalone output is generated
ENV NODE_ENV=production
RUN npx prisma generate
RUN pnpm build


# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Make sure Clerk environment variables are available in the runner stage as well
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_JA==

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Temporary fix for env var loading
COPY docker/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs

ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

EXPOSE 8080

# Start the application using the standalone server.js
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "server.js"]
