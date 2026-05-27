FROM oven/bun:alpine AS deps

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

FROM oven/bun:alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY=""
ARG NEXT_PUBLIC_GOOGLE_RECAPTCHA_ACTION="password_reset"

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY=${NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY}
ENV NEXT_PUBLIC_GOOGLE_RECAPTCHA_ACTION=${NEXT_PUBLIC_GOOGLE_RECAPTCHA_ACTION}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun run build

FROM oven/bun:alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.* ./

EXPOSE 3000

CMD ["bun", "run", "start"]