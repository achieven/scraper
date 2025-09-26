FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY . .
WORKDIR apps/scraper
RUN npm ci
RUN npm run build


FROM node:20-alpine AS runner
WORKDIR /usr/src/app
RUN ls
COPY --from=builder /usr/src/app .
# RUN npm i tslib
WORKDIR /usr/src/app/apps/scraper

# Set a non-root user for security (optional but recommended)
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

CMD ["npm", "run", "start:prod"]