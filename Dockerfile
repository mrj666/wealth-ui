FROM node:20-alpine AS builder
WORKDIR /app

# 先复制所有文件
COPY . .

# 在根目录安装所有依赖（包括 workspaces）
RUN npm install

# 构建前端（Vite 输出到 server/public）
WORKDIR /app/client
RUN npm run build

# 生产镜像
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/server /app/server
COPY --from=builder /app/package.json /app/package.json

ENV NODE_ENV=production
EXPOSE 16888

CMD ["node", "server/src/index.js"]
