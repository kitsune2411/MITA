# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Stage 2: Runtime
FROM node:18-alpine

# Install pm2
RUN npm install -g pm2

WORKDIR /app

COPY --from=builder /app /app

ENV NODE_ENV=production

EXPOSE 3000

CMD ["pm2-runtime", "start", "ecosystem.config.js"]
