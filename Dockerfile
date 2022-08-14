# PRODUCTION DOCKERFILE
# ---------------------
# This Dockerfile allows to build a Docker image of the NestJS application
# and based on a NodeJS 16 image. The multi-stage mechanism allows to build
# the application in a "builder" stage and then create a lightweight production
# image containing the required dependencies and the JS build files.
# 
# Dockerfile best practices
# https://docs.docker.com/develop/develop-images/dockerfile_best-practices/
# Dockerized NodeJS best practices
# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md
# https://www.bretfisher.com/node-docker-good-defaults/
# http://goldbergyoni.com/checklist-best-practice-of-node-js-in-production/

FROM node:16 as builder

ENV NODE_ENV build

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm@7

USER node
WORKDIR /home/node

RUN pnpm config set store-dir ~/.pnpm-store
COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN pnpm install --registry https://registry.npmmirror.com --strict-peer-dependencies false
# COPY --chown=node:node package.json ./
# RUN npm ci

COPY --chown=node:node . .
RUN npm run build 
#  && npm prune --production

# ---

FROM node:16-alpine

ENV NODE_ENV production

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories
RUN apk --no-cache add curl
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm@7

USER node
WORKDIR /home/node

COPY --from=builder --chown=node:node /home/node/package.json ./
# COPY --from=builder --chown=node:node /home/node/node_modules/ ./node_modules/
COPY --from=builder --chown=node:node /home/node/dist/ ./dist/

RUN pnpm config set store-dir ~/.pnpm-store
RUN pnpm install --registry https://registry.npmmirror.com --strict-peer-dependencies false

CMD ["pnpm","run", "start:prod"]