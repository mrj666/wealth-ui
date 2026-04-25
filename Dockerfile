FROM node:20-alpine AS builder
WORKDIR /app
# 复制 package.json 和 yarn.lock（没有就用 npm）
COPY package.json yarn.lock lerna.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm install -g yarn --silent && yarn install

# Build client
WORKDIR /app/client
RUN yarn build

# 生产镜像
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/client/dist /app/server/public
COPY --from=builder /app/server /app/server
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/lerna.json /app/lerna.json

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "server/src/index.js"]
