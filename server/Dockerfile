# ---------- ShopVerse Server (Node/Express API) ----------
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy all server code
COPY . .

# Set environment variables (optional defaults, can be overridden on Render)
ENV PORT=8080
ENV NODE_ENV=production
ENV MONGO_URI=mongodb+srv://rizsameer001_db_user:apyzUNvvS0p0318K@cluster0.xbnnnsq.mongodb.net/shopverse?appName=Cluster0

# Expose server port
EXPOSE 8080

# Start the server in production mode
CMD ["npm", "start"]