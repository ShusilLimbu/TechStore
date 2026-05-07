FROM node:20-apline

WORKDIR /backend

COPY package*.json ./

RUN npm install --only=production

COPY . .

EXPOSE 3000

CMD [ "node","server.js" ]