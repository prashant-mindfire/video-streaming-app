FROM node:20-alpine

WORKDIR /app

# Install dependencies first to leverage Docker cache
COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 5000

CMD ["npm", "start"]