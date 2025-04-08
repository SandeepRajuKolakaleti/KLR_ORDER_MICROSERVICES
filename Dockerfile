FROM node:latest as build
ARG version_suffix=0

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

#add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_module/.bin:$PATH
ENV version=$version_suffix

# Install app dependencies
COPY ./package*.json /usr/src/app/
RUN npm install --force

# RUN apk add chromium
# ENV CHROME_BIN=/usr/bin/chromium-browser
# RUN npm run test -- --browsers ChromeHeadlessNoSandbox --watch=false
# RUN npm test --karmaConfig='karma-headeless.conf.js'

# Bundle app source
ARG configuration=production
COPY . .
RUN npm run build
COPY ./ /usr/src/app

# Expose the listening port
EXPOSE 80

# Launch app
CMD ["npm", "run", "start:prod" ]

