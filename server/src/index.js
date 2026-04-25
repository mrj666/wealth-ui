const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

// 确保 data 目录存在（容器内 /app/data）
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 16888;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// 初始化数据库
require('./db/init');

// 中间件
app.use(cors());
app.use(bodyParser.json());

// API 路由（中央注册）
require('./routes')(app);

// 错误处理
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// 静态文件服务（client build 输出目录）
app.use(express.static(PUBLIC_DIR));

// SPA 路由：所有非 API 路由返回 index.html
app.get(/^\/(?!api\/)/, (req, res) => {
  const indexPath = path.join(PUBLIC_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build not found. Run "yarn build" first.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
