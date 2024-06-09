FROM node:16
WORKDIR /usr/src/app
COPY . .
RUN npm install
ENV PORT=8000
ENV REDIS_PORT=6379
EXPOSE ${PORT}
EXPOSE ${REDIS_PORT}
CMD [ "npm", "start" ]