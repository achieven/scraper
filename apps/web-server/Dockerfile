FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY . .
WORKDIR apps/web-server
RUN npm ci
RUN npm run build


FROM node:20-alpine AS runner
WORKDIR /usr/src/app
RUN ls
COPY --from=builder /usr/src/app .
# RUN npm i tslib
WORKDIR /usr/src/app/apps/web-server

# Set a non-root user for security (optional but recommended)
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser
EXPOSE 3001

CMD ["npm", "run", "start:prod"]