# Build stage: NodeJS 16 only to produce the bundle. It does not ship.
FROM node:16-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
# --ignore-scripts skips the husky `prepare` hook, which has no git repository
# to install into and no purpose inside an image.
RUN npm ci --ignore-scripts

COPY babel.config.js webpack.config.js ./
COPY public ./public
COPY src ./src

RUN npm run build

# Runtime stage: the bundle is static, so it is served by nginx and NodeJS does
# not ship in the final image.
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
