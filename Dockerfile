FROM node:latest

RUN mkdir -p /usr/src/bot

WORKDIR /usr/src/bot

COPY package.json /usr/src/bot
RUN npm install --omit=dev

COPY . /usr/src/bot
RUN npm run build

CMD ["npm", "start"]