FROM node:14-slim as dependencies

COPY package.json yarn.lock*  ./

RUN  yarn install --prod && yarn cache clean --force

FROM node:14-slim as build

COPY . .

RUN yarn install && yarn run build

FROM node:14-slim

WORKDIR /opt/node_app

RUN chown node /opt/node_app

USER node

COPY --from=dependencies /node_modules  ./node_modules

ENV PATH /opt/node_app/node_modules/.bin:$PATH

COPY --from=build /build/dist package.json ./

EXPOSE 8080

CMD ["yarn", "run", "start"]
