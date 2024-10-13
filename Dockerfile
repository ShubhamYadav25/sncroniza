FROM node:20.9.0
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3333
CMD ["node", "src/server/webSocketServer.js"]