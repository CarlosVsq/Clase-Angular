FROM node:20-alpine
RUN mkdir /my_app
COPY app.js /my_app
COPY package.json /my_app
WORKDIR /my_app
RUN apk --no-cache add --virtual build-deps build-base python3
RUN npm install
EXPOSE 3000
CMD node app.js
