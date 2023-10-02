FROM node:lts-alpine as base

# NOTE: if it still works, then I must have written the most awesome dockerfile as a noob. Otherwise, do whatever you want with it

RUN npm i -g @nestjs/cli
RUN npm i -g pnpm

WORKDIR /usr/src/app

COPY package.json /usr/src/app/
COPY pnpm-lock.yaml /usr/src/app/

RUN pnpm install

FROM base as development

ENV NODE_ENV=${NODE_ENV}

COPY . /usr/src/app/

RUN chmod +x start.sh

ENTRYPOINT ["/bin/sh", "./start.sh"]

FROM base as production

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN pnpm build
RUN pnpm prune --prod

RUN chown -R node:node /usr/src/app
USER node

ENTRYPOINT ["node", "dist/main"]
