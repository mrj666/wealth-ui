# Wealth UI - 家庭资产管理系统

一个简洁高效的家庭资产管理 Dashboard，支持多币种账户管理、净值追踪、历史走势分析和汇率管理。

## 功能特性

### 核心功能
- **多币种账户管理**：支持人民币（RMB）、美元（USD）、港币（HKD）
- **净值追踪**：记录账户净值变化，支持历史回溯
- **资产汇总**：自动计算总资产（按汇率转换为人民币）
- **股票占比统计**：追踪投资组合中股票资产占比
- **标签分类**：通过标签对账户进行分类管理

### 数据可视化
- **总资产走势图**：支持月度/季度/年度视图
- **账户净值历史**：每日/每周/每月粒度的净值折线图
- **资产分布柱状图**：直观展示各账户资产占比
- **汇率实时显示**：顶部状态栏显示当前汇率

### 数据管理
- **更新记录**：完整的净值更新历史，显示变化值
- **汇率管理**：支持手动更新或从 API 自动刷新汇率
- **账户编辑**：支持修改账户所有属性（名称、币种、初始净值、标签等）

## 技术栈

### 前端
- **React 18** - UI 框架
- **Vite** - 构建工具
- **Recharts** - 数据可视化
- **React Router** - 路由管理

### 后端
- **Node.js + Express** - API 服务
- **better-sqlite3** - SQLite 数据库
- **node-fetch** - 汇率 API 调用

### 开发工具
- **Yarn Workspaces** - Monorepo 管理
- **Concurrently** - 并行启动前后端

## 项目结构

```
wealth_ui/
├── client/                 # React 前端
│   ├── src/
│   │   ├── api/           # API 调用封装
│   │   ├── components/    # React 组件
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── pages/         # 页面组件
│   │   └── main.jsx       # 入口文件
│   └── package.json
├── server/                 # Express 后端
│   ├── src/
│   │   ├── db/            # 数据库 schema 和初始化
│   │   ├── routes/        # API 路由
│   │   ├── services/      # 业务逻辑
│   │   ├── utils/         # 工具函数
│   │   └── index.js       # 服务入口
│   ├── data/              # SQLite 数据库文件
│   └── package.json
└── package.json            # 根配置
```

## 快速开始

### 环境要求
- Node.js >= 16
- Yarn >= 1.22

### 安装依赖
```bash
yarn install
```

### 配置环境变量（可选）

汇率功能支持两种方式：
1. **手动编辑**：在首页顶部点击汇率可直接修改
2. **API 自动刷新**：配置 API key 后可自动获取最新汇率

如需使用 API 自动刷新，创建 `.env` 文件：
```env
EXCHANGERATE_API_KEY=your_api_key_here
PORT=16888
```

获取免费 API key：访问 [ExchangeRate-API](https://www.exchangerate-api.com/) 注册即可获得免费额度（每月 1500 次请求）。

### 开发模式
```bash
yarn dev
```
- 前端：http://localhost:5173
- 后端：http://localhost:16888

### 生产模式
```bash
yarn prod    # 构建并启动（推荐）
```
或分步执行：
```bash
yarn build   # 构建前端 → server/public
yarn start   # 启动服务（端口 16888）
```
访问 http://localhost:16888

### Docker 部署

#### 本地运行
```bash
docker compose up --build
```
访问 http://localhost:16888

#### NAS 部署

**方式一：导出镜像导入 NAS（推荐）**

在有 Docker 的电脑上构建并导出：
```bash
docker build -t wealth-ui:latest .
docker save -o wealth-ui.tar wealth-ui:latest
```

将 `wealth-ui.tar` 上传到 NAS，通过 Docker 管理界面导入镜像并创建容器：
- 端口映射：`16888 → 16888`
- 存储卷：NAS 目录（如 `/docker/wealth-ui/data`）→ 容器 `/app/data`

**方式二：NAS 上直接构建**
```bash
git clone https://github.com/mrj666/wealth-ui.git
cd wealth-ui
docker compose up -d --build
```

**数据持久化**

SQLite 数据存储在容器的 `/app/data` 目录，通过 volume 映射到宿主机。升级时数据不会丢失：
```bash
docker compose down
git pull
docker compose up -d --build
```

**数据备份**：只需备份宿主机上映射的 `data` 文件夹。

## 使用指南

### 1. 添加账户
- 进入「账户管理」页面
- 点击「+ 添加账户」
- 填写账户信息：
  - 账户名称（必填）
  - 币种（必填）
  - 初始净值（可选）
  - 初始净值日期（可选）
  - 标签（可选，逗号分隔）
  - 股票占比（可选）
  - 备注（可选）

### 2. 更新净值
- 在首页账户净值折线图右上角点击「更新净值」按钮
- 填写净值、日期、随记（可选）
- 保存后会在「更新记录」中留下历史记录

### 3. 编辑账户
- 在「账户管理」页面点击「编辑」
- 可修改账户所有属性，包括初始净值
- 编辑初始净值不会留下更新记录，直接覆盖

### 4. 管理汇率
- 首页顶部显示当前汇率
- 点击汇率可手动编辑
- 点击「刷新汇率」从 API 自动更新

### 5. 查看数据
- **首页**：总资产走势、资产分布柱状图、账户净值历史
- **账户管理**：账户列表、标签筛选
- **更新记录**：所有净值更新历史

## 数据库设计

### accounts 表
- `id` - 账户 ID
- `name` - 账户名称
- `currency` - 币种（RMB/USD/HKD）
- `description` - 备注
- `tags` - 标签（逗号分隔）
- `stock_ratio` - 股票占比（%）
- `created_at` - 创建时间
- `updated_at` - 更新时间

### valuations 表
- `id` - 记录 ID
- `account_id` - 账户 ID（外键）
- `value` - 净值
- `date` - 日期
- `note` - 随记
- `stock_ratio` - 股票占比（可覆盖账户默认值）
- `created_at` - 创建时间

### exchange_rates 表
- `id` - 汇率 ID
- `currency` - 币种（USD/HKD）
- `rate_to_rmb` - 对人民币汇率
- `updated_at` - 更新时间

## API 接口

### 账户管理
- `GET /api/accounts` - 获取所有账户
- `POST /api/accounts` - 创建账户
- `PUT /api/accounts/:id` - 更新账户
- `DELETE /api/accounts/:id` - 删除账户
- `GET /api/accounts/:id/valuations` - 获取账户净值历史

### 净值管理
- `POST /api/valuations` - 添加净值记录
- `GET /api/valuations/history` - 获取所有更新记录

### 汇率管理
- `GET /api/exchange-rates` - 获取汇率
- `POST /api/exchange-rates/refresh` - 刷新汇率
- `PUT /api/exchange-rates/:currency` - 更新汇率

### 数据汇总
- `GET /api/aggregated` - 获取资产汇总
- `GET /api/aggregated/total-history?days=30` - 获取总资产历史

## 性能优化

- **数据库索引**：`valuations(account_id, date)` 复合索引
- **查询优化**：使用 SQL 窗口函数计算变化值
- **前端缓存**：React hooks 缓存 API 响应
- **日期处理**：统一使用 UTC+8 时区

## 开发规范

### 代码风格
- 使用 ES6+ 语法
- 组件使用函数式组件 + Hooks
- API 调用统一封装在 `client/src/api/index.js`

### Git 提交规范
- `feat:` 新功能
- `fix:` 修复 bug
- `refactor:` 重构
- `ui:` UI 调整
- `docs:` 文档更新

## 许可证

MIT
