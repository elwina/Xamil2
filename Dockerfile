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
RUN pnpm build 
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