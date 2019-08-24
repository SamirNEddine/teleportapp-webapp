FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install && \
    npm cache clean --force

COPY . .

## Wait for api to run in dev environment
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.5.1/wait /wait
RUN chmod +x /wait

CMD /wait && npm start
