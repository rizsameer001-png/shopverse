# ---------- Build Stage ----------
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

# Use legacy-peer-deps to bypass strict peer conflicts
RUN npm install --legacy-peer-deps

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build