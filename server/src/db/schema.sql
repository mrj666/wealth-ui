-- 账户表
CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  currency TEXT NOT NULL CHECK(currency IN ('RMB', 'USD', 'HKD')),
  description TEXT,
  tags TEXT,
  stock_ratio REAL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 净值记录表（append-only 历史日志，支持真实历史 charting）
CREATE TABLE IF NOT EXISTS valuations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  value REAL NOT NULL,
  date TEXT NOT NULL,
  note TEXT,
  stock_ratio REAL DEFAULT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- 汇率表（rate_to_rmb = 1 外币 = ? 人民币）
CREATE TABLE IF NOT EXISTS exchange_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  currency TEXT NOT NULL UNIQUE CHECK(currency IN ('USD', 'HKD')),
  rate_to_rmb REAL NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 索引：优化按账户+日期查询净值
CREATE INDEX IF NOT EXISTS idx_valuations_account_date
ON valuations(account_id, date DESC);
