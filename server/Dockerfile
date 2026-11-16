FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first to leverage Docker cache
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine
WORKDIR /app

# Install FFmpeg & FFprobe for the video worker container
RUN apk add --no-cache ffmpeg

COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled JavaScript from builder
COPY --from=builder /app/dist ./dist

EXPOSE 5000
CMD ["npm", "run", "prod"]
