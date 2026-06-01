FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm install -g yarn --silent && yarn install

# Build client（Vite 直接输出到 server/public）
WORKDIR /app/client
RUN yarn build

# 生产镜像
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/server /app/server
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json

ENV NODE_ENV=production
EXPOSE 16888

CMD ["node", "server/src/index.js"]
