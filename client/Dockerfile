# ---------- Build Stage ----------
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json first and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Pass API URL at build time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the Vite project
RUN npm run build

# ---------- Production Stage ----------
FROM nginx:alpine

# Copy build output from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (Render uses this)
EXPOSE 80

# Keep Nginx running
CMD ["nginx", "-g", "daemon off;"]