# CLAUDE.md

家庭资产 Dashboard（Wealth UI）是一个 Monorepo，client + server 在同一仓库。

## Hard Rules

- **禁止编辑构建产物**：`server/public/**` 和 `client/dist/**` 是构建输出文件，直接修改会被下次 build 覆盖。
- **禁止硬编码密钥**：所有 secrets 必须放在 `.env` 文件中，通过 `process.env` 读取。
- **新增路由必须注册**：所有路由在 `server/src/routes/index.js` 中注册，忘记注册则路由不会生效。
- **Schema 变更需向后兼容**：SQLite 只支持有限的 ALTER TABLE，变更尽量用 `CREATE TABLE IF NOT EXISTS`，避免破坏现有数据。

## 项目结构

```
client/              # React 前端（Vite + Recharts）
server/              # Express API 服务（better-sqlite3）
  └── src/
    ├── index.js    # Express 入口，serve public/ + API
    ├── routes/     # 所有 API 路由（index.js 是中央注册表）
    └── db/         # SQLite schema + init
```

## 启动命令

```bash
yarn dev       # 同时启动 client(:5173) + server(:16888)
yarn build     # 构建 client 输出到 server/public
yarn start     # 仅启动 server（生产模式）
```

## 环境变量

`.env`（勿提交）：
```
EXCHANGERATE_API_KEY=your_key_here
PORT=16888
```

## 路由注册

新增 API 路由步骤：
1. 在 `server/src/routes/` 下创建 `xxx.js`，导出 `function(app)` 接收 express app
2. 在 `server/src/routes/index.js` 的 `registerRoutes` 中添加 `require('./xxx')(app)`
3. 在 `server/src/index.js` 中已自动加载 `require('./routes')(app)`，无需额外操作
