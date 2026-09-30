FROM node:22-alpine

WORKDIR /app

# Bağımlılıkları kopyala ve yükle
COPY package*.json ./
RUN npm install --omit=dev

# Uygulama kaynak kodlarını kopyala
COPY . .

# Veritabanı dizininin var olduğundan emin ol
RUN mkdir -p /app/data

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "server.js"]
