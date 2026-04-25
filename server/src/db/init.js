const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const DB_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DB_DIR, 'database.sqlite');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// 确保 data 目录存在
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// 连接数据库
const db = new Database(DB_PATH, { fileMustExist: false });
db.pragma('journal_mode = WAL');

// 读取并执行 schema
const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
db.exec(schema);

// 从 API 获取初始汇率（仅当 exchange_rates 为空时）
function seedExchangeRates() {
  const count = db.prepare('SELECT COUNT(*) as c FROM exchange_rates').get();
  if (count.c > 0) {
    console.log('Exchange rates already exist, skipping seed.');
    return;
  }

  const apiKey = process.env.EXCHANGERATE_API_KEY;
  if (!apiKey) {
    console.warn('No EXCHANGERATE_API_KEY found, using default rates.');
    insertDefaultRates();
    return;
  }

  fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`)
    .then(res => res.json())
    .then(data => {
      if (data.result === 'success') {
        const usdToRmb = data.conversion_rates['CNY']; // USD base -> CNY
        const hkdToRmb = data.conversion_rates['CNY'] / data.conversion_rates['HKD']; // HKD -> CNY

        const insert = db.prepare(
          'INSERT INTO exchange_rates (currency, rate_to_rmb) VALUES (?, ?)'
        );
        insert.run('USD', usdToRmb);
        insert.run('HKD', hkdToRmb);
        console.log(`Seeded exchange rates: USD=${usdToRmb}, HKD=${hkdToRmb}`);
      } else {
        console.warn('Failed to fetch rates from API:', data);
        insertDefaultRates();
      }
    })
    .catch(err => {
      console.error('Error fetching exchange rates:', err);
      insertDefaultRates();
    });
}

function insertDefaultRates() {
  const insert = db.prepare(
    'INSERT INTO exchange_rates (currency, rate_to_rmb) VALUES (?, ?)'
  );
  insert.run('USD', 7.24);
  insert.run('HKD', 0.92);
  console.log('Seeded default exchange rates: USD=7.24, HKD=0.92');
}

seedExchangeRates();

module.exports = db;
