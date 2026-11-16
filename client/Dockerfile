FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL=http://localhost:5000/api/v1
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Stage 2: Serve with Nginx ----
FROM nginx:alpine

# Remove default nginx site config
RUN rm /etc/nginx/conf.d/default.conf

# Add custom ngnix config (handles React routing + API proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static assets from the build stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
