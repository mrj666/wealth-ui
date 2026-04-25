const express = require('express');
const router = express.Router();
const db = require('../db/init');
const { convertToRmb } = require('../services/currencyConversion');
const { formatDate } = require('../utils/date');

module.exports = function(app) {
  app.use('/api/aggregated', router);

  // GET /api/aggregated/total-history?days=30 - 总资产历史走势
  router.get('/total-history', (req, res) => {
    try {
      const days = parseInt(req.query.days, 10) || 30;

      const accounts = db.prepare(`
        SELECT id, name, currency, created_at FROM accounts
      `).all();

      const rates = db.prepare('SELECT currency, rate_to_rmb FROM exchange_rates').all();

      // 找到最早的净值日期
      const earliestRow = db.prepare(`
        SELECT MIN(date) as min_date FROM valuations
      `).get();

      const earliestDate = earliestRow?.min_date;
      if (!earliestDate) {
        // 无净值记录，返回空数组
        return res.json([]);
      }

      // 计算展示的日期范围
      const endDate = new Date();
      const limitedStartDate = new Date();
      limitedStartDate.setDate(limitedStartDate.getDate() - days);
      const startDate = new Date(earliestDate);
      const finalStartDate = startDate > limitedStartDate ? startDate : limitedStartDate;

      // 加载所有净值记录（不限制日期范围，确保能向前填充）
      const valuations = db.prepare(`
        SELECT account_id, value, date, stock_ratio
        FROM valuations
        ORDER BY account_id, date ASC, id ASC
      `).all();

      // 按账户分组 valuations，并记录每个账户的最早净值日期
      const valsByAccount = {};
      const accountFirstDate = {};
      accounts.forEach(a => {
        valsByAccount[a.id] = [];
        accountFirstDate[a.id] = null;
      });
      valuations.forEach(v => {
        if (valsByAccount[v.account_id]) {
          valsByAccount[v.account_id].push(v);
          if (!accountFirstDate[v.account_id] || v.date < accountFirstDate[v.account_id]) {
            accountFirstDate[v.account_id] = v.date;
          }
        }
      });

      // 生成日期序列
      const dates = [];
      const cur = new Date(finalStartDate);
      while (cur <= endDate) {
        dates.push(formatDate(cur));
        cur.setDate(cur.getDate() + 1);
      }

      // 计算每天的总资产
      const result = dates.map(date => {
        let total = 0;
        accounts.forEach(acc => {
          // 账户在当天还没有净值记录则跳过
          if (!accountFirstDate[acc.id] || accountFirstDate[acc.id] > date) return;

          const vals = valsByAccount[acc.id] || [];
          // 使用最新的净值（向前填充到今天）
          const candidates = vals.filter(v => v.date <= date);
          const latest = candidates.length > 0 ? candidates.at(-1) : null;
          const value = latest ? latest.value : 0;
          const inRmb = convertToRmb(value, acc.currency, rates);
          total += inRmb;
        });
        return { date, value: Math.round(total * 100) / 100 };
      });

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/aggregated - 汇总资产
  router.get('/', (req, res) => {
    try {
      const accounts = db.prepare(`
        SELECT a.*,
          (SELECT v.value FROM valuations v WHERE v.account_id = a.id ORDER BY v.date DESC, v.id DESC LIMIT 1) as latest_value,
          (SELECT v.stock_ratio FROM valuations v WHERE v.account_id = a.id ORDER BY v.date DESC, v.id DESC LIMIT 1) as latest_stock_ratio
        FROM accounts a
        ORDER BY a.created_at DESC
      `).all();

      const rates = db.prepare('SELECT * FROM exchange_rates').all();

      let totalRmb = 0;
      let weightedStockSum = 0;

      const breakdown = accounts.map(acc => {
        const value = acc.latest_value || 0;
        const valueRmb = convertToRmb(value, acc.currency, rates);
        totalRmb += valueRmb;
        // 股票占比：优先用最新净值记录中的 stock_ratio，否则用账户级别的 stock_ratio
        const stockRatio = acc.latest_stock_ratio ?? acc.stock_ratio ?? 0;
        weightedStockSum += valueRmb * stockRatio;
        return {
          accountId: acc.id,
          name: acc.name,
          currency: acc.currency,
          latestValue: value,
          valueRmb,
          stockRatio,
          tags: acc.tags,
          description: acc.description,
        };
      });

      const totalStockRatio = totalRmb > 0 ? weightedStockSum / totalRmb : 0;

      res.json({
        totalRmb: Math.round(totalRmb * 100) / 100,
        totalStockRatio: Math.round(totalStockRatio * 100) / 100,
        breakdown,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};
