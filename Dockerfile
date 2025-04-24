# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

# Install pm2
RUN npm install -g pm2 --omit=dev

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY ecosystem.config.js ./

ENV NODE_ENV=production

CMD ["pm2-runtime", "start", "ecosystem.config.js"]
