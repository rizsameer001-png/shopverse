# ---------- ShopVerse Server (Node/Express API) ----------
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all server code
COPY . .

# Expose server port
EXPOSE 8080

# Start the server
CMD ["npm","start"]