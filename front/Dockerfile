# Etape 1 : build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_BACK_URL
ENV VITE_BACK_URL=$VITE_BACK_URL

RUN npm run build

# Etape 2 : serveur de fichiers statiques
FROM nginx:alpine AS runner



COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]