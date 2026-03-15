# ─────────────────────────────────────────
# ShopVerse Server Dockerfile
# Node.js + Vite
# ─────────────────────────────────────────

# ---------- Build Stage ----------
FROM node:20-alpine AS build

WORKDIR /app

# install dependencies
COPY package*.json ./
RUN npm install

# copy project
COPY . .

# build project
RUN npm run build


# ---------- Production Stage ----------
FROM node:20-alpine

WORKDIR /app

# copy built files
COPY --from=build /app ./

# install only production dependencies
RUN npm install --omit=dev

# expose server port
EXPOSE 8080

# start server
CMD ["npm","run","start"]