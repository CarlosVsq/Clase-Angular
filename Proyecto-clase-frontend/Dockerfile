# Paso 1
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG ENV_NAME=production
RUN npm run build -- --configuration=${ENV_NAME}

# Paso 2
FROM nginx:stable-alpine
COPY --from=build /app/dist/Proyecto-Clase/browser /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
